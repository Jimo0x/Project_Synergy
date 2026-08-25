-- ============================================================================
-- 001 — SÉCURISATION DU SCHÉMA (RLS, triggers, workflow commandes)
-- Projet Supabase : iyjpqhvdlffzkrfcocrz
-- ⚠️ DÉJÀ EXÉCUTÉ sur la base de production. Fichier conservé pour
--    documentation / reconstitution d'environnement.
--
-- Ordre d'exécution des migrations :
--   001_security_hardening.sql   (ce fichier)
--   002_fedapay_provider.sql     (enum provider 'fedapay')
--   003_seed_services.sql        (services de démonstration)
--   004_paid_order_flow.sql      (statut 'paid' + workflow v2 — SUPPLANTE la
--                                 fonction de ce fichier)
--   005_backfill_paid_orders.sql (commandes payées pré-existantes)
--   006_assign_freelancers.sql   (backfill freelancer_id)
--   007_payments_rls_fix.sql     (policy SELECT payments_payment)
--
-- Conventions :
--   - Le nom exact des types enum (rôle utilisateur) étant généré par la
--     migration Django→Supabase, on utilise `role::text` ou `%TYPE` pour
--     rester indépendant du nom du type.
--   - `auth.uid() IS NULL` signifie contexte privilégié (service_role,
--     SQL editor, triggers système) → bypass volontaire.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1 — Protection des colonnes sensibles de accounts_user
-- Un utilisateur non-admin ne peut jamais modifier :
--   id / role / email / is_active / date_joined
-- (bloque l'auto-promotion admin via l'API PostgREST)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_user_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Contexte privilégié (service_role / SQL editor) : on laisse passer.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Les administrateurs ont le droit de tout modifier.
  IF EXISTS (
    SELECT 1 FROM public.accounts_user a
    WHERE a.id = auth.uid() AND a.role::text = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.role::text IS DISTINCT FROM OLD.role::text
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.is_active IS DISTINCT FROM OLD.is_active
       OR NEW.date_joined IS DISTINCT FROM OLD.date_joined THEN
      RAISE EXCEPTION 'Modification des colonnes protégées (id, role, email, is_active, date_joined) réservée aux administrateurs.';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_columns ON public.accounts_user;
CREATE TRIGGER trg_protect_user_columns
BEFORE UPDATE ON public.accounts_user
FOR EACH ROW EXECUTE FUNCTION public.protect_user_columns();

-- ----------------------------------------------------------------------------
-- SECTION 2 — Policy INSERT sur orders_order : validation serveur du prix
-- Le client ne peut créer une commande qu'au prix EXACT du service actif,
-- pour lui-même, en statut 'pending', et pas sur son propre service.
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS order_insert_as_client ON public.orders_order;
CREATE POLICY order_insert_as_client
ON public.orders_order
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = auth.uid()
  AND status = 'pending'
  AND price = (
    SELECT s.price FROM public.services_service s WHERE s.id = service_id
  )
  AND EXISTS (
    SELECT 1 FROM public.services_service s
    WHERE s.id = service_id AND s.is_active = true
  )
  AND (
    SELECT s.created_by_id FROM public.services_service s WHERE s.id = service_id
  ) IS DISTINCT FROM auth.uid()
);

-- ----------------------------------------------------------------------------
-- SECTION 3 — Workflow des commandes (trigger UPDATE)
-- Colonnes figées après création : id, service_id, client_id, price, created_at
-- Attribution du freelance : par le client propriétaire, uniquement tant que
-- la commande est 'pending'.
-- Transitions autorisées (v1, avant introduction du statut 'paid' — voir 004) :
--   freelancer : pending→accepted | pending→cancelled
--                accepted→in_progress
--                in_progress→delivered
--   client     : pending→cancelled | accepted→cancelled
--                delivered→completed
-- ⚠️ Cette version est remplacée par celle du fichier 004 (statut 'paid').
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enforce_order_workflow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.accounts_user.role%TYPE;
BEGIN
  -- Contexte privilégié (webhook paiement, service_role) : bypass.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Création : la politique INSERT fait déjà la validation.
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Colonnes figées après création.
  IF NEW.id          IS DISTINCT FROM OLD.id
     OR NEW.service_id IS DISTINCT FROM OLD.service_id
     OR NEW.client_id  IS DISTINCT FROM OLD.client_id
     OR NEW.price      IS DISTINCT FROM OLD.price
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Colonnes protégées de la commande (id, service, client, prix, date) non modifiables.';
  END IF;

  SELECT u.role INTO v_role FROM public.accounts_user u WHERE u.id = auth.uid();

  -- Attribution d'un freelance : client propriétaire uniquement, avant acceptation.
  IF OLD.freelancer_id IS NULL AND NEW.freelancer_id IS NOT NULL THEN
    IF NEW.client_id <> auth.uid() OR OLD.status <> 'pending' THEN
      RAISE EXCEPTION 'Attribution du freelance non autorisée à ce stade.';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.freelancer_id IS DISTINCT FROM OLD.freelancer_id THEN
    RAISE EXCEPTION 'Le freelance assigné ne peut pas être changé.';
  END IF;

  IF v_role = 'freelancer' THEN
    IF NEW.freelancer_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Cette commande ne vous est pas assignée.';
    END IF;
    IF OLD.status = 'pending'     AND NEW.status IN ('accepted', 'cancelled') THEN RETURN NEW; END IF;
    IF OLD.status = 'accepted'    AND NEW.status = 'in_progress'              THEN RETURN NEW; END IF;
    IF OLD.status = 'in_progress' AND NEW.status = 'delivered'                THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Transition de statut non autorisée pour le freelance (% -> %).', OLD.status, NEW.status;

  ELSIF v_role = 'client' THEN
    IF NEW.client_id <> auth.uid() THEN
      RAISE EXCEPTION 'Cette commande ne vous appartient pas.';
    END IF;
    IF OLD.status IN ('pending', 'accepted') AND NEW.status = 'cancelled' THEN RETURN NEW; END IF;
    IF OLD.status = 'delivered'              AND NEW.status = 'completed' THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Transition de statut non autorisée pour le client (% -> %).', OLD.status, NEW.status;

  ELSE
    RAISE EXCEPTION 'Rôle non autorisé à modifier une commande.';
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_order_workflow ON public.orders_order;
CREATE TRIGGER trg_enforce_order_workflow
BEFORE INSERT OR UPDATE ON public.orders_order
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_workflow();

-- ----------------------------------------------------------------------------
-- SECTION 4 — Vue publique des créateurs (sans email ni données sensibles)
-- Utilisée par les pages publiques (détail service, catalogue).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, first_name, last_name, role
FROM public.accounts_user;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- SECTION 5 — Création automatique du profil à l'inscription (trigger auth.users)
-- Lit raw_user_meta_data : { role, first_name, last_name }.
-- Le rôle 'admin' n'est JAMAIS attribuable via l'inscription.
-- Crée aussi la ligne de profil métier si absente.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role  public.accounts_user.role%TYPE;
  v_first text;
  v_last  text;
BEGIN
  v_first := NULLIF(NEW.raw_user_meta_data->>'first_name', '');
  v_last  := NULLIF(NEW.raw_user_meta_data->>'last_name', '');

  BEGIN
    v_role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'client');
  EXCEPTION WHEN invalid_text_representation OR invalid_input_value THEN
    v_role := 'client';
  END;

  -- Jamais d'auto-promotion admin à l'inscription.
  IF v_role::text NOT IN ('client', 'freelancer') THEN
    v_role := 'client';
  END IF;

  INSERT INTO public.accounts_user (id, email, first_name, last_name, role)
  VALUES (NEW.id, NEW.email, v_first, v_last, v_role)
  ON CONFLICT (id) DO NOTHING;

  IF v_role::text = 'client'
     AND NOT EXISTS (SELECT 1 FROM public.accounts_clientprofile p WHERE p.user_id = NEW.id) THEN
    INSERT INTO public.accounts_clientprofile (user_id) VALUES (NEW.id);
  ELSIF v_role::text = 'freelancer'
     AND NOT EXISTS (SELECT 1 FROM public.freelancers_freelancerprofile p WHERE p.user_id = NEW.id) THEN
    INSERT INTO public.freelancers_freelancerprofile (user_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_user_profile ON auth.users;
CREATE TRIGGER trg_create_user_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- ----------------------------------------------------------------------------
-- SECTION 6 — Policies INSERT avec contrôle de rôle
--   services_service        → freelancer (propriétaire)
--   accounts_clientoffer    → client (propriétaire)
--   services_clientrequest  → client (propriétaire)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS service_insert_as_freelancer ON public.services_service;
CREATE POLICY service_insert_as_freelancer
ON public.services_service
FOR INSERT
TO authenticated
WITH CHECK (
  created_by_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.accounts_user u
    WHERE u.id = auth.uid() AND u.role::text = 'freelancer'
  )
);

DROP POLICY IF EXISTS clientoffer_insert_as_client ON public.accounts_clientoffer;
CREATE POLICY clientoffer_insert_as_client
ON public.accounts_clientoffer
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.accounts_user u
    WHERE u.id = auth.uid() AND u.role::text = 'client'
  )
);

DROP POLICY IF EXISTS clientrequest_insert_as_client ON public.services_clientrequest;
CREATE POLICY clientrequest_insert_as_client
ON public.services_clientrequest
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.accounts_user u
    WHERE u.id = auth.uid() AND u.role::text = 'client'
  )
);

-- ----------------------------------------------------------------------------
-- SECTION 7 — Backfill : profil métier pour les utilisateurs existants
-- ----------------------------------------------------------------------------

INSERT INTO public.accounts_clientprofile (user_id)
SELECT u.id
FROM public.accounts_user u
WHERE u.role::text = 'client'
  AND NOT EXISTS (SELECT 1 FROM public.accounts_clientprofile p WHERE p.user_id = u.id);

INSERT INTO public.freelancers_freelancerprofile (user_id)
SELECT u.id
FROM public.accounts_user u
WHERE u.role::text = 'freelancer'
  AND NOT EXISTS (SELECT 1 FROM public.freelancers_freelancerprofile p WHERE p.user_id = u.id);
