# Alouette

Plateforme de mise en relation locale : les citoyens scannent un QR code (affiché dans un lieu) pour rejoindre un groupe, discuter et proposer des sorties. Une mairie administre les groupes depuis un tableau de bord dédié.

## Structure

Le dépôt contient trois applications, avec une API commune aux deux front-ends. Le temps réel (messages, sorties) passe par Socket.IO.

- **`/`** — App citoyenne (front). Next.js 16, React 19, Tailwind CSS 4. Port `3000`.
- **`/dash`** — Tableau de bord mairie. Next.js 16, React 19, Tailwind CSS 4. Port `3001`.
- **`/server`** — API. Express 5, Prisma, PostgreSQL, Socket.IO, Zod. Port `4000`.

## Prérequis

- Node.js 20+
- PostgreSQL

## Liens utils en prod

- front                    #https://alouette.mue.agency/    Attention qr code requis. Pas de groupe par défaut
- dash                     #https://dash.alouette.mue.agency/  L'inscription à l'espace dash requiret un code spécifique.
  
## Installation et lancement

```bash
# API
cd server
npm install
npx prisma migrate dev      # crée le schéma en base
npm run dev                 # http://localhost:4000

# App citoyenne (à la racine)
npm install
npm run dev                 # http://localhost:3000

# Tableau de bord
cd dash
npm install
npm run dev                 # http://localhost:3001
```

## Build

```bash
# server : prisma generate + compilation TypeScript
cd server && npm run build && npm start

# front / dash
npm run build && npm start
```

