-- ============================================================================
-- 005 — Backfill : commandes payées avant l'introduction du statut 'paid'
-- Projet Supabase : iyjpqhvdlffzkrfcocrz
-- ⚠️ DÉJÀ EXÉCUTÉ sur la base de production. Fichier conservé pour
--    documentation / reconstitution d'environnement.
--
-- À exécuter dans une requête SÉPARÉE après 004_paid_order_flow.sql
-- (une valeur d'enum ajoutée n'est utilisable qu'après commit).
-- ============================================================================

UPDATE public.orders_order
SET status = 'paid'
WHERE status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.payments_payment p
    WHERE p.order_id = orders_order.id
      AND p.status = 'succeeded'
  );
