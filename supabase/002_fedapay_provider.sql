-- ============================================================================
-- 002 — Ajout du provider de paiement FedaPay
-- Projet Supabase : iyjpqhvdlffzkrfcocrz
-- ⚠️ DÉJÀ EXÉCUTÉ sur la base de production. Fichier conservé pour
--    documentation / reconstitution d'environnement.
-- ============================================================================

ALTER TYPE public.payment_provider ADD VALUE IF NOT EXISTS 'fedapay';
