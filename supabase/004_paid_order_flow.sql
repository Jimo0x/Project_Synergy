-- ============================================================================
-- 004 — Introduction du statut de commande 'paid' + workflow v2
-- Projet Supabase : iyjpqhvdlffzkrfcocrz
-- ⚠️ DÉJÀ EXÉCUTÉ sur la base de production. Fichier conservé pour
--    documentation / reconstitution d'environnement.
--
-- Cycle de vie final :
--   pending → paid → accepted → in_progress → delivered → completed
--        \                  \
--         → cancelled        → cancelled
--
--   - Le paiement validé (webhook / synchro retour) fait passer la commande
--     de 'pending' à 'paid' via service_role (bypass trigger : auth.uid()
--     IS NULL).
--   - Le freelance ne peut agir que sur une commande PAYÉE qui lui est
--     assignée : paid→accepted|cancelled, accepted→in_progress,
--     in_progress→delivered.
--   - Le client peut annuler tant que ce n'est pas livré-payé-traité :
--     pending/paid→cancelled, et valider la livraison : delivered→completed.
--
-- ⚠️ La nouvelle valeur enum n'est utilisable qu'après le commit de ce
--    script : exécuter 005_backfill_paid_orders.sql dans une requête SÉPARÉE.
-- ============================================================================

-- 1) Ajout de la valeur au type enum du statut commande.
--    Le nom réel du type est découvert dynamiquement (généré par la migration
--    Django→Supabase) : on ne suppose pas qu'il s'appelle order_status.
DO $$
DECLARE
  v_typname text;
BEGIN
  SELECT t.typname INTO v_typname
  FROM pg_type t
  JOIN pg_attribute a ON a.atttypid = t.oid
  WHERE a.attrelid = 'public.orders_order'::regclass
    AND a.attname = 'status';

  IF v_typname IS NULL THEN
    RAISE EXCEPTION 'Colonne orders_order.status introuvable.';
  END IF;

  EXECUTE format('ALTER TYPE public.%I ADD VALUE IF NOT EXISTS ''paid'' AFTER ''pending''', v_typname);
END;
$$;

-- 2) Workflow v2 — remplace intégralement la fonction du fichier 001.
CREATE OR REPLACE FUNCTION public.enforce_order_workflow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.accounts_user.role%TYPE;
BEGIN
  -- Contexte privilégié (webhook paiement, service_role, SQL editor) : bypass.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Création : la politique INSERT fait déjà la validation.
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Colonnes figées après création.
  IF NEW.id            IS DISTINCT FROM OLD.id
     OR NEW.service_id IS DISTINCT FROM OLD.service_id
     OR NEW.client_id  IS DISTINCT FROM OLD.client_id
     OR NEW.price      IS DISTINCT FROM OLD.price
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Colonnes protégées de la commande (id, service, client, prix, date) non modifiables.';
  END IF;

  SELECT u.role INTO v_role FROM public.accounts_user u WHERE u.id = auth.uid();

  -- Attribution d'un freelance : client propriétaire uniquement,
  -- tant que la commande n'a pas démarré (pending ou payée).
  IF OLD.freelancer_id IS NULL AND NEW.freelancer_id IS NOT NULL THEN
    IF NEW.client_id <> auth.uid() OR OLD.status NOT IN ('pending', 'paid') THEN
      RAISE EXCEPTION 'Attribution du freelance non autorisée à ce stade.';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.freelancer_id IS DISTINCT FROM OLD.freelancer_id THEN
    RAISE EXCEPTION 'Le freelance assigné ne peut pas être changé.';
  END IF;

  -- Aucun changement de statut : no-op autorisé.
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF v_role = 'freelancer' THEN
    IF NEW.freelancer_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Cette commande ne vous est pas assignée.';
    END IF;
    IF OLD.status = 'paid'        AND NEW.status IN ('accepted', 'cancelled') THEN RETURN NEW; END IF;
    IF OLD.status = 'accepted'    AND NEW.status = 'in_progress'              THEN RETURN NEW; END IF;
    IF OLD.status = 'in_progress' AND NEW.status = 'delivered'                THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Transition de statut non autorisée pour le freelance (% -> %).', OLD.status, NEW.status;

  ELSIF v_role = 'client' THEN
    IF NEW.client_id <> auth.uid() THEN
      RAISE EXCEPTION 'Cette commande ne vous appartient pas.';
    END IF;
    IF OLD.status IN ('pending', 'paid') AND NEW.status = 'cancelled' THEN RETURN NEW; END IF;
    IF OLD.status = 'delivered'          AND NEW.status = 'completed' THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Transition de statut non autorisée pour le client (% -> %).', OLD.status, NEW.status;

  ELSE
    RAISE EXCEPTION 'Rôle non autorisé à modifier une commande.';
  END IF;
END;
$$;
