# Alouette

Plateforme de mise en relation locale. Dans un lieu physique (commerce, équipement municipal, marché…), une affiche présente un **QR code**. Le citoyen le scanne, crée un profil léger et rejoint automatiquement un **groupe** rattaché à ce lieu. Il peut alors **discuter** en temps réel avec les autres membres et **proposer des sorties** (avec places limitées, refus, et sondages de créneaux). Une **mairie** administre les groupes et génère les QR codes depuis un **tableau de bord** dédié.

> Ce README documente l'intégralité de l'application (architecture, modèle de données, API, sécurité) à des fins d'évaluation.

## Sommaire

1. [Architecture](#architecture)
2. [Stack technique](#stack-technique)
3. [Structure du dépôt](#structure-du-dépôt)
4. [Modèle de données](#modèle-de-données)
5. [Authentification & sessions](#authentification--sessions)
6. [Autorisation](#autorisation)
7. [Temps réel (Socket.IO)](#temps-réel-socketio)
8. [Référence de l'API](#référence-de-lapi)
9. [Application citoyenne (front)](#application-citoyenne-front)
10. [Tableau de bord (dash)](#tableau-de-bord-dash)
11. [Couche service & conventions de code](#couche-service--conventions-de-code)
12. [Sécurité](#sécurité)
13. [Variables d'environnement](#variables-denvironnement)
14. [Prérequis & installation](#prérequis--installation)
15. [Base de données & migrations](#base-de-données--migrations)
16. [Scripts](#scripts)
17. [Build & déploiement](#build--déploiement)
18. [Conventions de contribution](#conventions-de-contribution)

---

## Architecture

Trois applications déployées séparément, autour d'une API commune.

```
   Citoyen (mobile)                         Agent mairie
        │                                        │
        ▼                                        ▼
┌──────────────────┐                   ┌──────────────────┐
│  Front citoyen   │                   │   Dashboard      │
│  Next.js  :3000  │                   │   Next.js  :3001 │
└────────┬─────────┘                   └─────────┬────────┘
         │       cookie httpOnly « session »      │
         │       REST (fetch) + WebSocket         │
         └───────────────────┬────────────────────┘
                             ▼
                  ┌──────────────────────┐
                  │   API  (Express 5)   │
                  │   REST + Socket.IO   │
                  │        :4000         │
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │  PostgreSQL (Prisma) │
                  └──────────────────────┘
```

- **Front citoyen** (`/`) — parcours d'onboarding par QR code, discussion temps réel, sorties. Accès réservé aux comptes `CITOYEN` (et `ADMIN`).
- **Dashboard** (`/dash`) — création de groupes, génération de QR codes, suivi des effectifs. Accès réservé aux comptes `ADMIN`.
- **API** (`/server`) — source de vérité unique : authentification, autorisation, règles métier, persistance, diffusion temps réel.

Les deux front-ends ne contiennent **aucune logique métier** : ils consomment l'API via une couche service typée et s'appuient sur le cookie de session pour l'identité.

## Stack technique

| Domaine | Choix | Pourquoi |
|---------|-------|----------|
| Front & Dash | **Next.js 16** (App Router), **React 19**, **TypeScript 5** | Rendu hybride, routage fichier, `middleware`/proxy de garde de route |
| Style | **Tailwind CSS 4** | Design system utilitaire, build via `@tailwindcss/postcss` |
| Temps réel client | **socket.io-client 4** | Réception live des messages et mises à jour de sorties |
| API | **Express 5** | Serveur HTTP minimal et éprouvé |
| Temps réel serveur | **Socket.IO 4** | Salons par groupe, handshake authentifié par cookie |
| Validation | **Zod 4** | Schémas d'entrée/sortie typés, `safeParse` au bord |
| ORM | **Prisma 6** | Schéma déclaratif, migrations versionnées, typage de bout en bout |
| Base | **PostgreSQL** | Relationnel, contraintes d'unicité, tableaux natifs (`interests`) |
| Mots de passe | **bcrypt** | Hachage salé (10 rounds) |
| Sessions | **HMAC-SHA256** maison + cookie httpOnly | Token signé sans dépendance JWT, comparaison constant-time |
| Anti-abus | **express-rate-limit** | Limitation des tentatives d'authentification |
| Upload | **file-type** | Vérification du type réel par *magic bytes* (pas l'extension) |
| QR codes | **qrcode** | Génération côté dashboard |

## Structure du dépôt

```
.
├── src/app/                      # ── FRONT CITOYEN (Next.js App Router)
│   ├── page.tsx                  #   Accueil public « scannez un QR code »
│   ├── layout.tsx                #   Layout racine + métadonnées
│   ├── proxy.ts                  #   Garde de route (middleware Next)
│   ├── front/
│   │   ├── page.tsx              #   Inscription via ?groupId (QR code)
│   │   ├── connexion/            #   Connexion citoyen
│   │   ├── bienvenue/            #   Écran d'accueil post-adhésion
│   │   ├── discu/                #   Discussion temps réel du groupe
│   │   ├── membre/               #   Liste des membres
│   │   ├── profil/               #   Profil personnel (édition, avatar)
│   │   ├── sorti/                #   Proposer / éditer une sortie
│   │   └── user/                 #   Profil public d'un autre membre
│   ├── hooks/                    #   useAuth, useMessages
│   ├── lib/socket.ts             #   Singleton Socket.IO (withCredentials)
│   └── services/                 #   Couche d'accès API (1 fichier / domaine)
│       ├── _http.ts              #   request<T> → Result<T>, gestion du 401
│       ├── auth · users · groups · messages · outings · config .service.ts
│
├── dash/src/app/                 # ── DASHBOARD MAIRIE (même organisation)
│   ├── page.tsx → redirect /connexion
│   ├── connexion/ · inscription/ · dashboard/
│   ├── error.tsx · not-found.tsx
│   ├── proxy.ts
│   └── services/ (_http, auth, groups, users)
│
└── server/                       # ── API
    ├── prisma/
    │   ├── schema.prisma         #   Modèle de données
    │   └── migrations/           #   Migrations versionnées
    ├── uploads/                  #   Avatars (servis sur /uploads)
    └── src/
        ├── index.ts              #   Bootstrap Express + Socket.IO + CORS
        ├── lib/
        │   ├── auth.ts           #   create/verifyToken (HMAC)
        │   ├── authMiddleware.ts #   requireAuth / requireAdmin
        │   ├── cookies.ts        #   Options du cookie de session
        │   ├── prisma.ts         #   Client Prisma singleton
        │   ├── errorMapper.ts    #   Codes d'erreur métier → HTTP
        │   └── username.ts       #   Génération de username unique
        ├── routes/               #   1 routeur Express par ressource
        │   └── auth · users · groups · messages · outings .ts
        └── usecases_dto/         #   1 dossier par cas d'usage
            └── <domaine>/<action>/
                ├── <action>.dto.ts       # schémas Zod in/out
                └── <action>.use-case.ts  # logique métier
```

## Modèle de données

PostgreSQL via Prisma. Identifiants en `cuid()`. Toutes les relations sont en `onDelete: Cascade`.

| Modèle | Rôle | Champs clés | Contraintes |
|--------|------|-------------|-------------|
| **User** | Compte (citoyen ou admin) | `username` (unique), `passwordHash`, `role`, `firstName`, `lastName`, `avatarUrl?`, `interests[]` | `username` unique |
| **Group** | Groupe rattaché à un lieu | `name`, `lieu`, `maxMembers` (déf. 4), `sessionNumber`, `baseGroupId?` | Auto-relation `GroupSessions` (un groupe « base » a des sessions) |
| **GroupMember** | Adhésion user↔groupe | `userId`, `groupId`, `joinedAt` | `@@unique([userId, groupId])` |
| **Message** | Message d'un groupe | `type` (`TEXT`/`OUTING`/`JOIN`), `content?`, `outingId?`, `sentAt` | Lié à un groupe, un auteur, et éventuellement une sortie |
| **Outing** | Sortie proposée | `title`, `date`, `location`, `maxSpots` (déf. 3), `recurring`, `hasPoll` | Créateur = `userId` |
| **OutingParticipant** | Participation à une sortie | `status` (`ACCEPTED`/`REFUSED`), `joinedAt` | `@@unique([outingId, userId])` |
| **OutingPollOption** | Créneau proposé au vote | `dateTime` | — |
| **OutingPollVote** | Vote pour un créneau | `optionId`, `userId` | `@@unique([optionId, userId])` |

**Enums** : `Role { CITOYEN, ADMIN }`, `MessageType { TEXT, OUTING, JOIN }`, `ParticipationStatus { ACCEPTED, REFUSED }`.

Les messages de type `OUTING` portent une sortie (carte interactive dans le fil) ; `JOIN` est un message système émis quand un membre rejoint le groupe.

## Authentification & sessions

Pas de JWT ni de librairie de session : un **token signé maison**, léger et vérifiable sans état serveur.

**Format du token** : `userId.expiresAt.signature`
- `signature = HMAC_SHA256(SESSION_SECRET, "userId.expiresAt")`, encodée en hex.
- TTL : **24 h** (`expiresAt` = timestamp ms d'expiration).
- Vérification (`verifyToken`) : 3 segments → `expiresAt` numérique et non expiré → signature recalculée comparée en **temps constant** (`timingSafeEqual`). Toute altération invalide le token.

**Transport** : cookie **`session`**, posé par l'API à l'inscription/connexion.

| Attribut | Valeur |
|----------|--------|
| `httpOnly` | `true` (inaccessible au JS → anti-XSS) |
| `sameSite` | `Lax` |
| `secure` | `true` en production |
| `domain` | `COOKIE_DOMAIN` (partage api/app/admin en prod ; omis en local) |
| `path` | `/` |
| `maxAge` | 24 h |

**Flux** : inscription/connexion → l'API valide → pose le cookie + renvoie l'identité non sensible (`userId`, `username`, `firstName`, `role`). Le client appelle ensuite l'API avec `credentials: "include"` ; le cookie voyage automatiquement. La déconnexion (`POST /api/auth/logout`) efface le cookie.

**Garde de route front** (`proxy.ts`, côté Next) : filtrage **UX uniquement** — présence + expiration du token, **sans** vérifier la signature (le secret reste sur l'API). Redirige les non-authentifiés hors des routes protégées et les authentifiés hors des pages de connexion. La validation réelle est toujours refaite par l'API.

## Autorisation

- **`requireAuth`** — exige un cookie de session valide ; expose `req.userId`. Renvoie `401` sinon.
- **`requireAdmin`** — `requireAuth` + vérifie en base que `role === "ADMIN"`. Renvoie `403` sinon.
- **Appartenance au groupe** — les routes de groupe/message/sortie vérifient que l'utilisateur est membre du groupe concerné (`NOT_MEMBER` → `403`).
- **Propriété** — seule la personne ayant créé une sortie peut la modifier (`NOT_OWNER` → `403`).

## Temps réel (Socket.IO)

Le serveur Socket.IO partage le port de l'API et la même politique CORS (origines explicites, `credentials`).

**Handshake** : authentifié par le **cookie `session`** du handshake (`io.use(...)`). Token invalide → connexion refusée. `socket.data.userId` est renseigné pour la session.

**Salons** : un salon par groupe, nommé `group:<groupId>`.

| Sens | Événement | Charge utile | Effet |
|------|-----------|--------------|-------|
| client → serveur | `join-group` | `groupId` | Vérifie l'appartenance puis rejoint `group:<id>` |
| client → serveur | `leave-group` | `groupId` | Quitte le salon |
| serveur → client | `new-message` | `Message` | Nouveau message / sortie / adhésion dans le groupe |
| serveur → client | `outing-updated` | sortie partielle | MAJ d'une sortie (participants, refus…) |
| serveur → client | `error` | `string` | Erreur (non-membre, erreur serveur) |

Côté front, le hook `useMessages` rejoint le salon, charge l'historique via REST, puis fusionne les événements live (dédoublonnage par `id`).

## Référence de l'API

Base : `/api`. l'auth se fait par cookie de session. Réponses et erreurs en JSON (`{ "error": "..." }`).

### Auth — `/api/auth` · *rate-limit 20 req / 15 min*

| Méthode | Chemin | Auth | Corps | Réponse | Erreurs |
|---------|--------|------|-------|---------|---------|
| POST | `/register` | — | `{ firstName, lastName, password, groupId? }` | `201 { userId, username, role, groupId? }` + cookie | `400` validation |
| POST | `/register-admin` | — | `{ firstName, lastName, password, secret }` | `201 { userId, username, firstName, role }` + cookie | `403` secret invalide |
| POST | `/login?app=front\|dash` | — | `{ firstName, password }` | `200 { userId, username, firstName, role, groupId? }` + cookie | `401` identifiants |
| POST | `/logout` | — | — | `200 { ok: true }` (efface le cookie) | — |

`groupId` n'est renvoyé au login qu'avec `?app=front`. À l'inscription avec `groupId`, un message système `JOIN` est diffusé au groupe.

### Utilisateurs — `/api/users`

| Méthode | Chemin | Auth | Corps | Réponse |
|---------|--------|------|-------|---------|
| GET | `/me` | requireAuth | — | `{ exists, user }` / `404 { exists: false }` |
| PATCH | `/me` | requireAuth | `{ firstName?, lastName?, interests? }` | profil mis à jour |
| POST | `/me/avatar` | requireAuth | corps binaire image (≤ 2 Mo) | `{ avatarUrl }` / `413` / `400` type |
| GET | `/:userId/profile` | requireAuth | — | profil public + activité / `404` |

### Groupes — `/api/groups`

| Méthode | Chemin | Auth | Corps | Réponse |
|---------|--------|------|-------|---------|
| GET | `/` | **requireAdmin** | — | `Group[]` (avec `sessionCount`, `totalMembers`) |
| POST | `/` | **requireAdmin** | `{ name, lieu }` | `201` groupe créé |
| GET | `/:groupId` | requireAuth + membre | — | groupe / `403` / `404` |
| GET | `/:groupId/members` | requireAuth | — | `{ members }` |
| POST | `/:groupId/join` | requireAuth | — | `201` / `404` / `409` déjà membre |

### Messages — `/api/messages` · *toutes en requireAuth*

| Méthode | Chemin | Corps | Réponse |
|---------|--------|-------|---------|
| GET | `/:groupId` | — | `Message[]` / `403` non-membre |
| POST | `/:groupId` | `{ content }` | `201` message (+ diffusion `new-message`) |

### Sorties — `/api/outings` · *toutes en requireAuth*

| Méthode | Chemin | Corps | Réponse |
|---------|--------|-------|---------|
| POST | `/:groupId/propose` | `{ title, date, location, maxSpots?, recurring?, pollOptions? }` | `201` (+ `new-message`) |
| GET | `/:outingId` | — | détail de la sortie |
| PATCH | `/:outingId` | `{ title, date, location, maxSpots }` | sortie MAJ (+ `outing-updated`) / `403` non-créateur |
| POST | `/:outingId/join` | — | `{ participantCount }` (+ `outing-updated`) / `409` complet ou déjà inscrit |
| DELETE | `/:outingId/join` | — | `{ participantCount }` (+ `outing-updated`) |
| POST | `/:outingId/refuse` | — | `{ acceptedCount, refusedCount }` (+ `outing-updated`) |
| POST | `/poll/:optionId/vote` | — | `201` / `409` déjà voté |

### Codes d'erreur métier

Levés comme `Error(CODE)` dans les cas d'usage, traduits en HTTP par `lib/errorMapper.ts` :

| Code | HTTP | | Code | HTTP |
|------|------|--|------|------|
| `GROUP_NOT_FOUND` / `OUTING_NOT_FOUND` / `USER_NOT_FOUND` / `OPTION_NOT_FOUND` | 404 | | `INVALID_CREDENTIALS` | 401 |
| `NOT_MEMBER` / `NOT_OWNER` / `INVALID_SECRET` | 403 | | `NO_SPOTS_LEFT` | 409 |
| `ALREADY_MEMBER` / `ALREADY_PARTICIPANT` / `ALREADY_REFUSED` / `ALREADY_VOTED` / `NOT_PARTICIPANT` | 409 | | *(non mappé)* | 500 |

## Application citoyenne (front)

| Route | Page | Rôle |
|-------|------|------|
| `/` | Accueil | Page publique : invite à scanner un QR code |
| `/front?groupId=…` | Inscription | Création de profil (prénom, nom, mot de passe) et adhésion au groupe du QR |
| `/front/connexion` | Connexion | Retour d'un citoyen existant |
| `/front/bienvenue` | Bienvenue | Présentation du groupe et de ses membres après adhésion |
| `/front/discu` | Discussion | Fil temps réel : messages, cartes de sorties, rejoindre/quitter/refuser |
| `/front/membre` | Membres | Liste des membres du groupe |
| `/front/profil` | Mon profil | Édition (centres d'intérêt) et upload d'avatar |
| `/front/sorti` | Sortie | Proposer une nouvelle sortie ou éditer la sienne |
| `/front/user` | Profil public | Consulter le profil et l'activité d'un autre membre |

Routes protégées par le proxy : `/front/discu`, `/front/sorti`. `userId`/`groupId` (non sensibles) sont conservés en `localStorage` pour le confort de navigation ; l'identité fait toujours autorité côté cookie.

## Tableau de bord (dash)

| Route | Page | Rôle |
|-------|------|------|
| `/` | — | Redirige vers `/connexion` |
| `/connexion` | Connexion | Accès admin (refuse les comptes non-`ADMIN`) |
| `/inscription` | Inscription | Création d'un compte admin, protégée par un **secret** |
| `/dashboard` | Tableau de bord | Liste des groupes, création, génération/téléchargement du **QR code** d'adhésion |

Le QR code encode `<NEXT_PUBLIC_CITIZEN_URL>/front?groupId=<id>` : le scan amène directement le citoyen sur le formulaire d'inscription du bon groupe. Route protégée par le proxy : `/dashboard`.

## Couche service & conventions de code

- **Aucun `fetch` direct dans les pages.** Tout passe par `src/app/services/<domaine>.service.ts`.
- Helper commun `_http.ts` : `request<T>(path, init)` renvoie un `Result<T>` discriminé :
  ```ts
  type Result<T> = { isOk: true; data: T } | { isOk: false; error: string };
  ```
  Il injecte `credentials: "include"`, parse les erreurs, et centralise le **401** (sur route protégée → logout + redirection ; les 401 de `/api/auth/*` restent des erreurs d'identifiants).
- **Côté serveur**, chaque opération est un *use-case* isolé dans `usecases_dto/<domaine>/<action>/` : un schéma **Zod** d'entrée/sortie (`*.dto.ts`) et la logique (`*.use-case.ts`), ré-exportés via un `index.ts` barrel. Les erreurs métier sont des **codes** traduits en HTTP au même endroit (`errorMapper`).
- **Nommage** : variables explicites et orientées domaine ; pas de `data`/`result`/`tmp` génériques dans la logique métier.

## Sécurité

- **Mots de passe** hachés avec **bcrypt** (10 rounds) ; longueur bornée (6–72) côté validation.
- **Sessions** : token **HMAC-SHA256** signé, vérifié en **temps constant** ; cookie **`httpOnly`** + `SameSite=Lax` (+ `Secure` en prod). L'auth repose **exclusivement** sur ce cookie (HTTP et WebSocket).
- **CORS strict** : origines **explicites** (`FRONTEND_URL`, `DASH_URL`), jamais `*`, avec `credentials`.
- **Rate-limiting** des routes d'authentification (20 req / 15 min).
- **Validation systématique** des entrées via Zod (`safeParse`) au bord, avec **bornes hautes** (longueurs, tailles de tableaux) pour limiter les charges abusives.
- **Upload d'avatar durci** : type réel vérifié par *magic bytes* (`file-type`, png/jpeg/webp uniquement) ; taille plafonnée à **2 Mo** avec coupure du flux dès dépassement (anti-DoS mémoire).
- **Secrets** uniquement via variables d'environnement (`SESSION_SECRET`, `ADMIN_REGISTRATION_SECRET`, `DATABASE_URL`…).
- **Inscription admin** protégée par un secret comparé en temps constant.
- **`trust proxy`** activé (déploiement derrière proxy) pour une lecture fiable de l'IP par le rate-limiter.

### `server/.env`

| Variable | Requis | Description |
|----------|:---:|-------------|
| `DATABASE_URL` | ✅ | Connexion PostgreSQL |
| `SESSION_SECRET` | ✅ | Secret de signature HMAC des tokens |
| `ADMIN_REGISTRATION_SECRET` | ✅ | Code exigé pour créer un compte admin |
| `FRONTEND_URL` | — | Origine CORS du front (déf. `http://localhost:3000`) |
| `DASH_URL` | — | Origine CORS du dashboard (déf. `http://localhost:3001`) |
| `COOKIE_DOMAIN` | — | Domaine partagé du cookie en prod (omis en local) |
| `PORT` | — | Port de l'API (déf. `4000`) |
| `NODE_ENV` | — | `production` active `Secure` sur le cookie |

### `/.env.local` (front citoyen)

| Variable | Requis | Description |
|----------|:---:|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | URL de base de l'API (ex. `http://localhost:4000`) |

### `dash/.env.local` (dashboard)

| Variable | Requis | Description |
|----------|:---:|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | URL de base de l'API |
| `NEXT_PUBLIC_CITIZEN_URL` | — | URL du front encodée dans le QR code (déf. `http://localhost:3000`) |

## Prérequis & installation

- **Node.js 20+**
- **PostgreSQL**

```bash
# 1. API
cd server
npm install
# crée server/.env (voir tableau ci-dessus), puis :
npx prisma migrate dev      # applique le schéma en base
npm run dev                 # http://localhost:4000

# 2. App citoyenne (à la racine du dépôt)
npm install
# crée .env.local avec NEXT_PUBLIC_API_URL
npm run dev                 # http://localhost:3000

# 3. Tableau de bord
cd dash
npm install
# crée dash/.env.local
npm run dev                 # http://localhost:3001
```

Premier compte admin : ouvrir `http://localhost:3001/inscription` et saisir le `ADMIN_REGISTRATION_SECRET` configuré.

## Base de données & migrations

```bash
cd server
npx prisma migrate dev --name <nom>   # créer + appliquer une migration (dev)
npx prisma migrate deploy             # appliquer les migrations (prod ; lancé par `npm start`)
npx prisma generate                   # régénérer le client (auto en postinstall)
npx prisma studio                     # explorateur de données
```

## Scripts

### `server`

| Script | Action |
|--------|--------|
| `npm run dev` | `tsx watch` avec rechargement (`--env-file=.env`) |
| `npm run build` | `prisma generate && tsc` → `dist/` |
| `npm start` | `prisma migrate deploy && node dist/index.js` |
| `postinstall` | `prisma generate` (automatique) |

### front (`/`) et dash (`/dash`)

| Script | Action |
|--------|--------|
| `npm run dev` | Serveur de dev Next.js (dash sur `--port 3001`) |
| `npm run build` | Build de production |
| `npm start` | Sert le build de production |
| `npm run lint` | ESLint (`eslint-config-next`) |


## Build & déploiement

- **Front & dash** → **Vercel**. `.vercelignore` exclut `server/` du déploiement front.
- **API** → **Render**, derrière **Cloudflare**. `app.set("trust proxy", 1)` est requis pour que le rate-limiter lise l'IP via `X-Forwarded-For`. Le script `start` applique les migrations Prisma avant de démarrer le serveur compilé.

En production, l'API, le front et le dashboard partagent un domaine parent (`COOKIE_DOMAIN`) pour que le cookie de session soit valable sur les sous-domaines.

## Conventions de contribution

- **Nommage** : `camelCase` (variables/fonctions), `PascalCase` (types/composants), noms de fichiers en `kebab-case` côté serveur (`*.use-case.ts`, `*.dto.ts`).
- **Structure serveur** : 1 ressource = 1 routeur ; 1 opération = 1 dossier `usecases_dto/<domaine>/<action>/` (DTO Zod + use-case + barrel).
- **Structure front** : pages dans `app/`, accès API exclusivement via `services/`, état partagé via `hooks/`.
- **Commits** : messages descriptifs, souvent préfixés par un type ou une étiquette (`fix:`, `feat:`, `[Integration]`…).
- **Branches** : `main` (intégration), branches de fonctionnalités préfixées par auteur/thème (ex. `giovani-integration-…`).

## Liens en production

- Front citoyen : <https://alouette.mue.agency/> (accès via QR code — aucun groupe par défaut)
- Dashboard : <https://dash.alouette.mue.agency/> (inscription protégée par un secret)