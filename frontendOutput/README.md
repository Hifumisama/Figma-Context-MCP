# Portfolio John Doe - Next.js

Ce projet est une reproduction de la maquette Figma "Portfolio BadVersion" utilisant Next.js, TypeScript et Tailwind CSS.

## Fonctionnalités

- **Design responsive** : Adapté aux écrans desktop et mobile
- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité de type
- **Tailwind CSS** pour le styling
- **Polices Google Fonts** (Poppins)
- **Images optimisées** avec Next.js Image

## Structure du projet

```
frontendOutput/
├── src/
│   ├── app/
│   │   ├── globals.css      # Styles globaux
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Page d'accueil
│   └── components/
│       ├── Header.tsx       # En-tête avec navigation
│       ├── Hero.tsx         # Section héro avec photo de profil
│       ├── About.tsx        # Section à propos
│       ├── Experience.tsx   # Timeline d'expérience
│       ├── Work.tsx         # Portfolio de projets
│       └── Contact.tsx      # Informations de contact
├── public/
│   └── images/              # Images du portfolio
└── Configuration files...
```

## Installation et lancement

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

3. **Ouvrir** [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run start` - Lance l'application en mode production
- `npm run lint` - Vérifie le code avec ESLint

## Customisation

Le design utilise une palette de couleurs basée sur la maquette Figma :

- **Primary** (#03045E) : Bleu foncé pour le texte principal
- **Secondary** (#474306) : Brun/jaune foncé pour les accents
- **Accent** (#F7F197) : Jaune clair pour les titres de section
- **Background** (#FBF8CC) : Jaune très clair pour l'arrière-plan

Ces couleurs peuvent être modifiées dans `tailwind.config.ts`.

## Technologies utilisées

- [Next.js](https://nextjs.org/) - Framework React
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript typé
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
- [Google Fonts](https://fonts.google.com/) - Police Poppins
