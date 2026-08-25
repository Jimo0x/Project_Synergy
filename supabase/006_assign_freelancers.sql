-- ============================================================================
-- 006 — Backfill : attribution du freelance sur les commandes existantes
-- Projet Supabase : iyjpqhvdlffzkrfcocrz
-- ⚠️ DÉJÀ EXÉCUTÉ sur la base de production. Fichier conservé pour
--    documentation / reconstitution d'environnement.
--
-- Modèle économique actuel : chaque service appartient à un freelancer
-- (services_service.created_by_id) ; les commandes lui sont directement
-- assignées à la création (voir Server Action createOrder).
-- Ce script rattrape les commandes créées avant cette règle.
-- ============================================================================

UPDATE public.orders_order o
SET freelancer_id = s.created_by_id
FROM public.services_service s
WHERE s.id = o.service_id
  AND o.freelancer_id IS NULL
  AND s.created_by_id IS NOT NULL;
