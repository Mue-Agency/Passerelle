This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

----------------------------------------------------------------------------------------------------------------------------------

## PASSERELLE
Notre projet : WebApp 
Notre application cible des utilisateurs sur leur smartphone, parfois en déplacement (4G/5G dans la rue ou un marché), la vitesse de chargement est cruciale.

Le Rendu Hybride (SSR / RSC) : Next.js permet d'afficher instantanément la structure de la page (le squelette de la messagerie) depuis le serveur. L'utilisateur ne voit pas un écran blanc le temps que le JavaScript charge.

Optimisation des ressources : Next.js optimise automatiquement les polices (comme votre police Nunito Sans) et les images, réduisant la consommation de données mobiles. ( eco-responsable )


Ce qui doit rester côté Client ("use client") : 
La liste des messages, le champ de saisie, les états d'ouverture du clavier, le défilement automatique (scroll). 
Les deux pages actuelles sont correctement configurées en "use client".

Ce qui doit être fait côté Serveur : 
La vérification initiale de la session de l'utilisateur et la récupération initiale des informations du groupe 


Next.js seul ne gère pas le stockage des messages ni le "temps réel". Il lui faut un moteur :
Supabase est la solution la plus moderne et s'intègre parfaitement avec Next.js. 
Il fournit :
L'authentification 
La base de données pour stocker les messages.

Le module Realtime (WebSockets) pour que le message envoyé par Marie apparaisse instantanément sur l'écran de Jean sans qu'il ait besoin de rafraîchir la page.


### Schéma 
[ Écran Client : Next.js ] 
       │
       ▼ (1. Envoi du message via formulaire)
[ API Route / Server Action Next.js ]
       │
       ▼ (2. Enregistrement sécurisé)
[ Base de données (Supabase/Firebase) ]
       │
       ▼ (3. Diffusion instantanée via WebSocket)
[ Tous les autres smartphones connectés au groupe ]

