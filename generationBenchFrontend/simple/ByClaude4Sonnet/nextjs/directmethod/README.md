# Portfolio John Doe - NextJS

Ce projet est une implémentation fidèle de la maquette Figma "Portfolio BadVersion" en utilisant NextJS 15, React 19 et Tailwind CSS.

## 🎨 Design

Le portfolio présente un design moderne avec :
- Une palette de couleurs cohérente (bleu foncé, brun foncé, jaunes)
- Une typographie Poppins élégante
- Des composants réutilisables et modulaires
- Un design responsive adaptatif

## 🏗️ Architecture

### Structure des composants

```
components/
├── ui/           # Composants UI réutilisables
│   └── Button.tsx
├── layout/       # Composants de mise en page
│   ├── Header.tsx
│   └── Navigation.tsx
└── sections/     # Sections de la page
    ├── Hero.tsx
    ├── About.tsx
    ├── Work.tsx
    └── Contact.tsx
```

### Technologies utilisées

- **NextJS 15.5.0** - Framework React avec App Router
- **React 19.1.0** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Framework CSS utility-first
- **Poppins Font** - Police Google Fonts

## 🚀 Installation et lancement

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
```

### Build de production
```bash
npm run build
npm start
```

## 📱 Sections

### Header
- Logo/Nom "John Doe"
- Navigation (Home, About, Work)
- Icônes réseaux sociaux (Medium, Behance, Twitter)

### Hero
- Photo de profil stylisée
- Titre principal "Hello, I'm John, Product Designer"
- Localisation "based in Netherland."
- Bouton CV avec style personnalisé

### About
- Description personnelle
- Timeline des expériences professionnelles
- 3 périodes : 2014-2018, 2018-2020, 2020-Present

### Work  
- Présentation de 2 projets/études de cas
- Images de projet avec descriptions
- Dates de publication

### Contact
- Description contact
- Photo de contact
- Liens vers email et réseaux sociaux

## 🎨 Couleurs

- **Bleu foncé** (#03045E) - Texte principal
- **Brun foncé** (#474306) - Accents et bordures
- **Jaune** (#F5EE84) - Boutons et éléments interactifs
- **Jaune clair** (#FBF8CC) - Arrière-plan principal
- **Jaune très clair** (#F7F197) - Titres de sections

## 📂 Assets

Les images sont stockées dans `/public/images/` :
- `profile-image.png` - Photo de profil principale
- `contact-image.png` - Photo de la section contact
- `project1.png` & `project2.png` - Images des projets
- `medium-icon.svg`, `behance-icon.svg`, `twitter-icon.svg` - Icônes sociales

## 🔧 Configuration

Le projet utilise :
- **Tailwind CSS** avec couleurs personnalisées
- **Police Poppins** avec poids multiples (400, 500, 600, 800)
- **ESLint** pour la qualité du code
- **TypeScript** pour le typage

## 📝 Développement

Le code suit les bonnes pratiques :
- Composants fonctionnels React avec TypeScript
- Hooks React pour la gestion d'état
- Classes Tailwind CSS pour le styling
- Structure modulaire et réutilisable
- Navigation smooth scroll entre sections

---

*Implémentation réalisée d'après la maquette Figma avec une attention particulière aux détails et à la fidélité du design.*