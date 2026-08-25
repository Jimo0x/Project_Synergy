-- ============================================================================
-- 003 — Services de démonstration (catalogue)
-- Projet Supabase : iyjpqhvdlffzkrfcocrz
-- ⚠️ DÉJÀ EXÉCUTÉ sur la base de production. Fichier conservé pour
--    documentation / reconstitution d'environnement.
--
-- Idempotent : un service n'est inséré que si son slug n'existe pas déjà.
-- Créateur : Jean Dupon (freelancer de démonstration).
-- ============================================================================

DO $$
DECLARE
  v_creator uuid := 'f792e2a7-c442-47be-8a6c-02d60061414d'; -- jean@gmail.com
BEGIN
  INSERT INTO public.services_service (title, slug, description, category, price, delivery_time_days, created_by_id, is_active)
  SELECT 'Landing page vitrine sur mesure', 'landing-page-vitrine-sur-mesure',
         'Une landing page moderne, responsive et optimisée pour la conversion : design unique, intégration formulaire de contact, SEO technique de base.',
         'web', 75000, 5, v_creator, true
  WHERE NOT EXISTS (SELECT 1 FROM public.services_service WHERE slug = 'landing-page-vitrine-sur-mesure');

  INSERT INTO public.services_service (title, slug, description, category, price, delivery_time_days, created_by_id, is_active)
  SELECT 'Logo et charte graphique', 'logo-et-charte-graphique',
         'Création d''un logo professionnel avec 3 propositions, retouches incluses, et mini-charte graphique (couleurs, typographies, usages).',
         'design', 50000, 4, v_creator, true
  WHERE NOT EXISTS (SELECT 1 FROM public.services_service WHERE slug = 'logo-et-charte-graphique');

  INSERT INTO public.services_service (title, slug, description, category, price, delivery_time_days, created_by_id, is_active)
  SELECT 'Gestion des réseaux sociaux (1 mois)', 'gestion-reseaux-sociaux-1-mois',
         'Community management pendant 30 jours : calendrier éditorial, 12 publications visuelles, modération des commentaires et rapport mensuel.',
         'marketing', 90000, 30, v_creator, true
  WHERE NOT EXISTS (SELECT 1 FROM public.services_service WHERE slug = 'gestion-reseaux-sociaux-1-mois');

  INSERT INTO public.services_service (title, slug, description, category, price, delivery_time_days, created_by_id, is_active)
  SELECT 'Identité visuelle complète', 'identite-visuelle-complete',
         'Branding complet : logo, palette, typographies, cartes de visite, templates réseaux sociaux et guide de marque PDF.',
         'branding', 120000, 10, v_creator, true
  WHERE NOT EXISTS (SELECT 1 FROM public.services_service WHERE slug = 'identite-visuelle-complete');

  INSERT INTO public.services_service (title, slug, description, category, price, delivery_time_days, created_by_id, is_active)
  SELECT 'Audit SEO de site web', 'audit-seo-de-site-web',
         'Audit complet de votre site : technique, contenu, performances et netlinking. Rapport détaillé avec plan d''action priorisé.',
         'seo', 60000, 7, v_creator, true
  WHERE NOT EXISTS (SELECT 1 FROM public.services_service WHERE slug = 'audit-seo-de-site-web');

  INSERT INTO public.services_service (title, slug, description, category, price, delivery_time_days, created_by_id, is_active)
  SELECT 'Rédaction d''articles SEO (x4)', 'redaction-articles-seo-x4',
         'Quatre articles de blog optimisés SEO (800 à 1200 mots), recherche de mots-clés incluse, prêts à publier.',
         'writing', 25000, 6, v_creator, true
  WHERE NOT EXISTS (SELECT 1 FROM public.services_service WHERE slug = 'redaction-articles-seo-x4');
END;
$$;
