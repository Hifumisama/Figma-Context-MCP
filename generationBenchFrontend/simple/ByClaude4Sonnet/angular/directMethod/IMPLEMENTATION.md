# Portfolio John Doe - Implémentation Angular

## 📋 Aperçu

Ce projet est une implémentation fidèle de la maquette Figma "Portfolio BadVersion" en utilisant Angular 19. L'application présente un portfolio moderne avec navigation fluide et design responsive.

## 🎨 Maquette Figma

**Source :** [Portfolio BadVersion](https://www.figma.com/design/HGbcy1F99nWQOoxyQxtevi/Portfolio-BadVersion?node-id=0-1&p=f&t=Rin5PUBpdw4lXHf9-0)

## 🏗️ Architecture des Composants

### 1. **HeaderComponent** (`src/app/components/header/`)
- **Fonctionnalité :** Navigation fixe en haut de page
- **Contenu :**
  - Logo/Nom "John Doe"
  - Menu de navigation : Home, About, Work
  - Icônes sociales : Medium, Behance, Twitter
- **Responsive :** Adaptation mobile avec navigation empilée

### 2. **HeroComponent** (`src/app/components/hero/`)
- **Fonctionnalité :** Section de présentation principale
- **Contenu :**
  - Nom et titre "Product Designer"
  - Texte d'introduction
  - Image de profil avec cadre stylisé
  - Bouton "Resume"
  - Éléments décoratifs (rectangles et croix)
- **Layout :** Grille 2 colonnes (texte + image)

### 3. **AboutComponent** (`src/app/components/about/`)
- **Fonctionnalité :** Section à propos avec timeline
- **Contenu :**
  - Titre "about." avec accent coloré
  - Description personnelle
  - Timeline d'expériences professionnelles :
    - 2014-2018
    - 2018-2020
    - 2020 - Present
- **Design :** Timeline verticale avec marqueurs

### 4. **WorkComponent** (`src/app/components/work/`)
- **Fonctionnalité :** Portfolio de projets
- **Contenu :**
  - Titre "work." avec accent coloré
  - Description du travail
  - Grille de projets (2 colonnes)
  - Cards de projets avec images et descriptions
- **Interactions :** Hover effects sur les cards

### 5. **ContactComponent** (`src/app/components/contact/`)
- **Fonctionnalité :** Section de contact
- **Contenu :**
  - Titre "contact." avec accent coloré
  - Image de contact
  - Description
  - Informations de contact (email, Twitter, Behance)
- **Layout :** Image à gauche, infos à droite

## 🎨 Design System

### Couleurs (Variables CSS)
```scss
--color-primary: #03045E;      // Bleu principal
--color-secondary: #474306;    // Vert/brun secondaire
--color-accent-light: #FBF8CC; // Jaune clair
--color-accent-medium: #F7F197; // Jaune moyen (titres)
--color-accent-dark: #F5EE84;   // Jaune foncé (boutons)
--color-white: #FFFFFF;
--color-black: #000000;
```

### Typographie
- **Police :** Poppins (Google Fonts)
- **Poids :** 400 (regular), 500 (medium), 600 (semi-bold), 800 (extra-bold)
- **Classes utilitaires :**
  - `.heading-primary` : 100px, poids 800 (titres principaux)
  - `.heading-secondary` : 28px, poids 500 (sous-titres)
  - `.heading-tertiary` : 24px, poids 600 (titres de sections)
  - `.text-body` : 24px, poids 400 (corps de texte)
  - `.text-small` : 18px, poids 400
  - `.text-tiny` : 15px, poids 400

### Responsive Design
- **Desktop** : > 968px (layout complet)
- **Tablet** : 768px - 968px (adaptations mineures)
- **Mobile** : < 768px (layout empilé, navigation responsive)

## 📁 Structure des Fichiers

```
src/
├── app/
│   ├── components/
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   └── header.component.scss
│   │   ├── hero/
│   │   ├── about/
│   │   ├── work/
│   │   └── contact/
│   ├── app.component.ts
│   ├── app.component.html
│   └── app.component.scss
├── assets/
│   └── images/
│       ├── profile-image.png
│       ├── contact-image.png
│       ├── project1.png
│       ├── project2.png
│       ├── medium-icon.svg
│       ├── behance-icon.svg
│       └── twitter-icon.svg
└── styles.scss (styles globaux)
```

## 🚀 Utilisation

### Démarrer l'application

```bash
# Installer les dépendances (si nécessaire)
npm install

# Démarrer le serveur de développement
npm start

# L'application sera disponible sur http://localhost:4200
```

### Build de production

```bash
npm run build
```

## ✨ Fonctionnalités Implémentées

- ✅ **Design System complet** basé sur la maquette Figma
- ✅ **Navigation fluide** avec ancres vers les sections
- ✅ **Images optimisées** téléchargées depuis Figma
- ✅ **Responsive design** pour tous les appareils
- ✅ **Composants réutilisables** avec architecture modulaire
- ✅ **Animations et transitions** CSS
- ✅ **Accessibilité** (aria-labels, liens sémantiques)
- ✅ **Performance** (lazy loading, optimisation des images)

## 🔧 Personnalisation

### Modifier le contenu
Les données sont centralisées dans chaque composant TypeScript :
- **Hero :** `src/app/components/hero/hero.component.ts`
- **About :** `src/app/components/about/about.component.ts`
- **Work :** `src/app/components/work/work.component.ts`
- **Contact :** `src/app/components/contact/contact.component.ts`

### Modifier les styles
- **Variables globales :** `src/styles.scss`
- **Styles spécifiques :** Dans chaque fichier `.scss` de composant

### Ajouter des images
Placer les images dans `src/assets/images/` et référencer le chemin dans les composants.

## 📱 Compatibilité

- **Navigateurs :** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Appareils :** Desktop, Tablet, Mobile
- **Angular :** Version 19.2.0

## 🎯 Prochaines étapes possibles

1. **Animation avancée :** Intégrer Angular Animations
2. **Navigation :** Router Angular pour navigation SPA
3. **Formulaire de contact** fonctionnel
4. **Mode sombre** avec switch
5. **Internationalisation** (i18n)
6. **Blog/CMS** integration
7. **Tests unitaires** et e2e

---

**Créé par :** Claude Sonnet 4  
**Basé sur :** Maquette Figma Portfolio BadVersion  
**Technologie :** Angular 19, SCSS, TypeScript
