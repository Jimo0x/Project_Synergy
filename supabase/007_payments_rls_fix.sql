-- ============================================================================
-- 007 — Réparation RLS : lecture des paiements par les participants
-- Projet Supabase : iyjpqhvdlffzkrfcocrz
-- ⚠️ DÉJÀ EXÉCUTÉ sur la base de production. Fichier conservé pour
--    documentation / reconstitution d'environnement.
--
-- Constat : les policies SELECT historiques sur payments_payment bloquaient
-- les clients légitimes → panier aveugle aux paiements existants (doublons),
-- page de retour incapable d'afficher le statut réel.
--
-- Décision :
--   - LECTURE : les participants de la commande uniquement (client OU
--     freelance assigné).
--   - ÉCRITURE : serveur uniquement (service_role bypass RLS) — aucune
--     policy INSERT/UPDATE/DELETE volontairement.
--
-- Note : le SQL editor de Supabase affiche un avertissement « destructive
-- operations » (DROP POLICY dynamique dans le DO block) — c'est attendu.
-- ============================================================================

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'payments_payment'
      AND cmd        = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.payments_payment', r.policyname);
  END LOOP;
END;
$$;

CREATE POLICY payment_select_order_participants
ON public.payments_payment
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders_order o
    WHERE o.id = payments_payment.order_id
      AND (o.client_id = auth.uid() OR o.freelancer_id = auth.uid())
  )
);
