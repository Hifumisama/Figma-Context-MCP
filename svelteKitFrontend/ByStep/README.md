# Portfolio John Doe - SvelteKit Implementation

🎨 **Implémentation fidèle de la maquette Figma avec SvelteKit en suivant une approche TDD**

## 📋 Description

Ce projet reproduit parfaitement la maquette Figma du portfolio de John Doe en utilisant SvelteKit. L'implémentation a été réalisée suivant une méthodologie TDD (Test-Driven Development) avec des composants modulaires et réutilisables.

## ✨ Fonctionnalités

- ✅ **Design fidèle** à la maquette Figma
- ✅ **Architecture modulaire** avec composants réutilisables
- ✅ **Tests TDD** complets pour tous les composants
- ✅ **Responsive design** (mobile, tablette, desktop)
- ✅ **Animations fluides** et interactions
- ✅ **Accessibilité optimisée** (ARIA, navigation clavier)
- ✅ **Performance** optimisée (lazy loading, CSS variables)

## 🏗️ Architecture

```
src/
├── lib/
│   ├── components/
│   │   ├── layout/        # Header, Container
│   │   ├── navigation/    # Navigation, SocialLinks
│   │   ├── hero/          # HeroSection, HeroText, HeroImage, ResumeButton
│   │   ├── about/         # AboutSection
│   │   ├── work/          # ProjectCard
│   │   ├── contact/       # ContactSection
│   │   └── ui/            # Button, SectionTitle (composants génériques)
│   ├── styles/            # Styles globaux avec variables CSS Figma
│   └── utils/             # Constantes et utilitaires
├── routes/                # Pages SvelteKit
└── static/images/         # Assets images extraites de Figma
```

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ 
- npm ou pnpm

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Ouvrir automatiquement dans le navigateur
npm run dev -- --open
```

### Tests

```bash
# Lancer tous les tests
npm run test

# Tests en mode watch
npm run test:unit

# Tests avec couverture
npm run test -- --coverage
```

## 🎨 Design System

### Palette de couleurs (extraite de Figma)
- **Primaire**: `#03045E` (Bleu foncé)
- **Secondaire**: `#474306` (Marron foncé)  
- **Accent**: `#F7F197` (Jaune clair)
- **Arrière-plan**: `#FBF8CC` (Crème)
- **Surface**: `#F5EE84` (Jaune)

### Typographie
- **Police**: Poppins (Google Fonts)
- **Tailles**: 15px à 100px (responsive)
- **Poids**: 400, 500, 600, 800

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablette**: 480px - 768px  
- **Desktop**: > 768px

## 🧪 Tests

Le projet utilise **Vitest** avec **Playwright** pour les tests :

- Tests unitaires pour chaque composant
- Tests d'accessibilité 
- Tests responsive
- Tests d'interactions utilisateur

### Exemples de composants testés :
- `Button.svelte.test.js` - Variants, états, accessibilité
- `HeroText.svelte.test.js` - Props, structure HTML
- `Navigation.svelte.test.js` - Navigation, smooth scrolling
- `ProjectCard.svelte.test.js` - Affichage projets, liens

## 📂 Structure des fichiers

### Composants principaux
- **Header** - Navigation + logo + liens sociaux
- **HeroSection** - Section principale avec titre et image
- **AboutSection** - Timeline des expériences  
- **WorkSection** - Grille des projets
- **ContactSection** - Informations de contact

### Templates de référence
- `vanillaTemplate/` - Implémentation HTML/CSS/JS de référence
- `COMPONENT_ARCHITECTURE.md` - Documentation détaillée de l'architecture

## 🔧 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run test         # Lancer les tests
npm run lint         # Vérifier le code
npm run format       # Formater le code
```

## 📈 Performance

- ⚡ **Chargement rapide** avec preload des polices
- 🖼️ **Images optimisées** (WebP, lazy loading)
- 🎨 **CSS optimisé** avec variables natives
- ♿ **Accessibilité** conforme WCAG 2.1

## 🛠️ Technologies utilisées

- **SvelteKit** - Framework principal
- **Vitest** - Tests unitaires
- **Playwright** - Tests navigateur
- **CSS Variables** - Système de design
- **Poppins** - Police Google Fonts

## 🎯 Méthodologie TDD

1. **Extraction** des données Figma
2. **Template vanilla** de référence
3. **Architecture** des composants
4. **Tests** écrits en premier (TDD)
5. **Implémentation** respectant les tests
6. **Intégration** finale

## 📝 Licence

Ce projet est un exemple d'implémentation pour démonstration.

---

**Développé avec ❤️ en suivant les meilleures pratiques SvelteKit et TDD**