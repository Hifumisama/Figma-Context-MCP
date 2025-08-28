# Portfolio John Doe - Implémentation SvelteKit

Ce projet est une implémentation fidèle de la maquette Figma "Portfolio Corrected" en utilisant SvelteKit et TailwindCSS.

## 🎨 Design

La maquette originale est disponible sur [Figma](https://www.figma.com/design/yaZFysgcTn6HB5JWaEcq2O/Portfolio-Corrected?t=kFaCNLzDJCV6YBIB-0)

### Couleurs principales
- **Light Yellow**: `#FBF8CC` - Fond principal
- **Dark Blue**: `#03045E` - Texte principal  
- **Yellow Brand**: `#F5EE84` - Accents et boutons
- **Dark Brown**: `#474306` - Bordures et accents

### Police
- **Poppins** avec différents poids (400, 500, 600, 800)

## 🏗️ Architecture des composants

Le projet est structuré avec des composants réutilisables et modulaires :

### Composants de base
- `Button.svelte` - Bouton avec états (active/clicked)
- `SocialIcons.svelte` - Icônes des réseaux sociaux
- `ProfileImage.svelte` - Image de profil stylisée

### Composants de layout
- `Header.svelte` - En-tête avec navigation
- `HeroSection.svelte` - Section de présentation principale
- `AboutSection.svelte` - Section à propos avec timeline
- `WorkSection.svelte` - Section portfolio/travaux
- `ContactSection.svelte` - Section contact

### Composants spécialisés
- `AboutTimelineItem.svelte` - Élément de timeline pour l'expérience
- `StudyCase.svelte` - Carte d'étude de cas

## 🚀 Installation et développement

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 📁 Structure des fichiers

```
src/
├── lib/
│   ├── assets/                 # Images téléchargées de Figma
│   │   ├── profile-image.png
│   │   ├── study-case-1.png
│   │   ├── study-case-2.png
│   │   ├── contact-image.png
│   │   ├── medium-icon.svg
│   │   ├── behance-icon.svg
│   │   └── twitter-icon.svg
│   ├── components/             # Composants réutilisables
│   │   ├── Button.svelte
│   │   ├── SocialIcons.svelte
│   │   ├── Header.svelte
│   │   ├── ProfileImage.svelte
│   │   ├── AboutTimelineItem.svelte
│   │   ├── StudyCase.svelte
│   │   ├── HeroSection.svelte
│   │   ├── AboutSection.svelte
│   │   ├── WorkSection.svelte
│   │   └── ContactSection.svelte
│   └── index.ts               # Export des composants
├── routes/
│   └── +page.svelte          # Page principale
├── app.css                   # Styles globaux
└── app.html                  # Template HTML
```

## 🎯 Fonctionnalités implémentées

- ✅ Design fidèle à la maquette Figma
- ✅ Composants modulaires et réutilisables
- ✅ Navigation responsive
- ✅ Images optimisées téléchargées de Figma
- ✅ Typographie Poppins
- ✅ Couleurs et espacements précis
- ✅ Interactions de base (hover, etc.)
- ✅ Structure sémantique HTML
- ✅ Accessibilité de base

## 🛠️ Technologies utilisées

- **SvelteKit** - Framework web moderne
- **TailwindCSS v4** - Framework CSS utility-first
- **TypeScript** - Typage statique
- **Vite** - Build tool rapide
- **ESLint** + **Prettier** - Qualité de code

## 📱 Responsive

Le design est principalement optimisé pour desktop (1440px) selon la maquette Figma. Des adaptations responsive peuvent être ajoutées selon les besoins.

## 🔧 Personnalisation

Les composants sont conçus pour être facilement personnalisables via des props TypeScript. Vous pouvez modifier :
- Les textes et contenus
- Les liens sociaux
- Les images
- Les couleurs via TailwindCSS

## 📄 License

Ce projet est une implémentation éducative de la maquette Figma fournie.