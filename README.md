# SynergyCraft — marketplace freelance

Marketplace freelance **dual-side** : les clients commandent des services, les freelances
les réalisent, le paiement passe par **FedaPay** (Mobile Money, cartes). Le projet a
commencé en Django puis a migré vers **Next.js + Supabase**, avec une sécurité portée
par la base elle-même (Row Level Security).

## Stack

| Couche | Techno |
|---|---|
| Front + server actions | Next.js 16 (App Router), React 19, Tailwind 4, daisyUI |
| Base de données & auth | Supabase (PostgreSQL, Auth, RLS) |
| Paiement | FedaPay (sandbox / live), webhook signé |
| Validation | Zod |
| 3D / animations | Three.js, GSAP |

## Fonctionnalités

- Inscription, connexion et réinitialisation de mot de passe (Supabase Auth)
- Catalogue public de services, pages de détail
- **Espace client** : commandes, offres, panier, paiement
- **Espace freelance** : missions, services, statistiques
- Messagerie, profil, paramètres
- Paiement FedaPay avec vérification au retour **et** par webhook signé (HMAC + horodatage)

## Sécurité

- **RLS sur toutes les tables** : chaque utilisateur ne lit et n'écrit que ses propres
  données (`supabase/001_security_hardening.sql`).
- Workflow des commandes verrouillé par triggers SQL : un client ne peut pas passer
  lui-même une commande en « payée » (`004_paid_order_flow.sql`).
- La clé `service_role` n'est utilisée que côté serveur (server actions, webhooks),
  **après** vérification de la propriété de la commande.
- Entrées des server actions validées avec Zod.

## Lancer en local

```bash
cd web
cp .env.example .env.local     # puis remplis les clés Supabase et FedaPay (sandbox)
npm install
npm run dev                    # http://localhost:3000
```

### Base de données

Les migrations SQL sont dans `supabase/`, à exécuter **dans l'ordre** (001 → 007)
depuis l'éditeur SQL de Supabase. L'ordre et le rôle de chaque fichier sont décrits
en tête de `001_security_hardening.sql`.

## Structure

```
supabase/          migrations SQL (RLS, triggers, workflow, seed)
templates/         anciennes vues Django (avant la migration vers Next.js)
web/src/app/       pages (auth, dashboard client/freelance, public), server actions, webhooks
web/src/lib/       clients Supabase (navigateur, serveur, admin), garde d'authentification, paiements
```

## Auteur

**Julio Dahou** — [github.com/Jimo0x](https://github.com/Jimo0x)
