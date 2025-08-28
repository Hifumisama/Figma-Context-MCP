# Architecture des Composants SvelteKit

## Vue d'ensemble

Cette architecture décompose le portfolio en composants SvelteKit réutilisables, cohérents et maintenables. Chaque composant a une responsabilité unique et peut être testé indépendamment.

## Hiérarchie des composants

```
src/
├── routes/
│   └── +page.svelte                 # Page principale (composition des composants)
├── lib/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.svelte        # Header avec navigation et réseaux sociaux
│   │   │   └── Container.svelte     # Conteneur réutilisable avec max-width
│   │   ├── navigation/
│   │   │   ├── Navigation.svelte    # Menu de navigation principal
│   │   │   └── SocialLinks.svelte   # Liens des réseaux sociaux
│   │   ├── hero/
│   │   │   ├── HeroSection.svelte   # Section hero complète
│   │   │   ├── HeroText.svelte      # Texte du hero (titre, sous-titre)
│   │   │   ├── HeroImage.svelte     # Image avec éléments décoratifs
│   │   │   └── ResumeButton.svelte  # Bouton de téléchargement CV
│   │   ├── about/
│   │   │   ├── AboutSection.svelte  # Section about complète
│   │   │   ├── Timeline.svelte      # Composant timeline
│   │   │   └── TimelineItem.svelte  # Item individuel de timeline
│   │   ├── work/
│   │   │   ├── WorkSection.svelte   # Section work complète
│   │   │   ├── ProjectGrid.svelte   # Grille des projets
│   │   │   └── ProjectCard.svelte   # Carte de projet individuelle
│   │   ├── contact/
│   │   │   ├── ContactSection.svelte # Section contact complète
│   │   │   └── ContactInfo.svelte   # Informations de contact
│   │   └── ui/
│   │       ├── Button.svelte        # Bouton générique réutilisable
│   │       ├── SectionTitle.svelte  # Titre de section stylisé
│   │       └── DecorativeBars.svelte # Barres décoratives animées
│   ├── stores/
│   │   └── navigation.js            # Store pour la navigation active
│   ├── utils/
│   │   ├── animations.js            # Utilitaires d'animation
│   │   └── constants.js             # Constantes (couleurs, tailles, etc.)
│   └── styles/
│       ├── global.css               # Styles globaux et variables CSS
│       └── animations.css           # Animations CSS réutilisables
└── static/
    └── images/                      # Images statiques du portfolio
```

## Description détaillée des composants

### 1. Layout Components (`lib/components/layout/`)

#### `Header.svelte`
**Responsabilité**: Structure principale du header
- Intègre Navigation et SocialLinks
- Gère le responsive design
- Contient le logo "John Doe"

**Props**:
```typescript
interface Props {
  logo?: string;
}
```

#### `Container.svelte`
**Responsabilité**: Conteneur réutilisable avec contraintes de largeur
- Max-width responsive
- Padding horizontal consistant
- Centrage automatique

**Props**:
```typescript
interface Props {
  maxWidth?: string;
  padding?: string;
}
```

### 2. Navigation Components (`lib/components/navigation/`)

#### `Navigation.svelte`
**Responsabilité**: Menu de navigation principal
- Smooth scrolling vers les sections
- Gestion de l'état actif
- Responsive (collapse sur mobile)

**Props**:
```typescript
interface Props {
  items: Array<{
    href: string;
    label: string;
  }>;
}
```

#### `SocialLinks.svelte`
**Responsabilité**: Liens vers les réseaux sociaux
- Icônes SVG
- Animations hover
- Accessibilité (aria-labels)

**Props**:
```typescript
interface Props {
  links: Array<{
    href: string;
    icon: string;
    name: string;
  }>;
}
```

### 3. Hero Components (`lib/components/hero/`)

#### `HeroSection.svelte`
**Responsabilité**: Conteneur principal de la section hero
- Layout grid responsive
- Orchestration des sous-composants

#### `HeroText.svelte`
**Responsabilité**: Contenu textuel du hero
- Titre principal avec animation
- Sous-titre et greeting
- Typographie responsive

**Props**:
```typescript
interface Props {
  greeting: string;
  title: string;
  subtitle: string;
}
```

#### `HeroImage.svelte`
**Responsabilité**: Image de profil avec décorations
- Image responsive
- Éléments décoratifs (icônes plus)
- Effet parallax léger

**Props**:
```typescript
interface Props {
  src: string;
  alt: string;
  showDecorations?: boolean;
}
```

#### `ResumeButton.svelte`
**Responsabilité**: Bouton de téléchargement CV
- Animation click
- État de loading
- Téléchargement de fichier

**Props**:
```typescript
interface Props {
  downloadUrl?: string;
  disabled?: boolean;
}
```

### 4. About Components (`lib/components/about/`)

#### `AboutSection.svelte`
**Responsabilité**: Section about complète
- Titre de section
- Description
- Timeline

**Props**:
```typescript
interface Props {
  title: string;
  description: string;
  timelineItems: TimelineItem[];
}
```

#### `Timeline.svelte`
**Responsabilité**: Conteneur timeline avec animations
- Animation séquentielle des items
- Ligne de connexion visuelle

**Props**:
```typescript
interface Props {
  items: TimelineItem[];
}
```

#### `TimelineItem.svelte`
**Responsabilité**: Item individuel de timeline
- Point de timeline
- Période et description
- Animation d'apparition

**Props**:
```typescript
interface TimelineItem {
  period: string;
  description: string;
}
```

### 5. Work Components (`lib/components/work/`)

#### `WorkSection.svelte`
**Responsabilité**: Section work complète
- Titre et description
- ProjectGrid

**Props**:
```typescript
interface Props {
  title: string;
  description: string;
  projects: Project[];
}
```

#### `ProjectGrid.svelte`
**Responsabilité**: Grille responsive des projets
- Layout CSS Grid
- Responsive (1-2 colonnes)

#### `ProjectCard.svelte`
**Responsabilité**: Carte de projet individuelle
- Image de projet
- Métadonnées (date, titre, description)
- Animation hover

**Props**:
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  link?: string;
}
```

### 6. Contact Components (`lib/components/contact/`)

#### `ContactSection.svelte`
**Responsabilité**: Section contact complète
- Layout avec image et informations
- Responsive design

#### `ContactInfo.svelte`
**Responsabilité**: Informations de contact
- Liste des moyens de contact
- Liens cliquables avec validation

**Props**:
```typescript
interface ContactMethod {
  type: 'email' | 'social';
  label: string;
  value: string;
  href: string;
}

interface Props {
  contacts: ContactMethod[];
}
```

### 7. UI Components (`lib/components/ui/`)

#### `Button.svelte`
**Responsabilité**: Bouton générique réutilisable
- Variants (primary, secondary, outline)
- États (loading, disabled)
- Tailles (small, medium, large)

**Props**:
```typescript
interface Props {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
}
```

#### `SectionTitle.svelte`
**Responsabilité**: Titre de section stylisé
- Typographie cohérente
- Animation d'apparition
- Point après le titre

**Props**:
```typescript
interface Props {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}
```

#### `DecorativeBars.svelte`
**Responsabilité**: Barres décoratives animées
- Animation séquentielle
- Configuration du nombre de barres

**Props**:
```typescript
interface Props {
  count?: number;
  animationDelay?: number;
}
```

## Stores et State Management

### `navigation.js`
Store Svelte pour gérer l'état de navigation :
```javascript
// Gestion de la section active
export const activeSection = writable('home');

// Fonction pour mettre à jour la section active
export function setActiveSection(sectionId) {
  activeSection.set(sectionId);
}
```

## Utilitaires

### `animations.js`
Fonctions utilitaires pour les animations :
- `smoothScrollTo(elementId)`
- `createIntersectionObserver(callback, options)`
- `animateOnScroll(elements, animationClass)`

### `constants.js`
Constantes de l'application :
- Palette de couleurs
- Tailles de typographie
- Breakpoints responsive
- Configuration d'animation

## Tests

Chaque composant aura des tests correspondants :
```
src/lib/components/
├── hero/
│   ├── HeroSection.svelte
│   ├── HeroSection.test.js
│   ├── HeroText.svelte
│   ├── HeroText.test.js
│   └── ...
```

## Avantages de cette architecture

1. **Réutilisabilité** : Composants génériques (Button, Container)
2. **Maintenabilité** : Séparation claire des responsabilités
3. **Testabilité** : Chaque composant peut être testé isolément
4. **Performance** : Composants légers avec lazy loading
5. **Accessibilité** : Structure sémantique et ARIA labels
6. **Responsive** : Design mobile-first cohérent

## Convention de nommage

- **Composants** : PascalCase (ex: `HeroSection.svelte`)
- **Props** : camelCase (ex: `maxWidth`, `animationDelay`)
- **Stores** : camelCase (ex: `activeSection`)
- **Fichiers CSS** : kebab-case (ex: `global.css`)
- **Constantes** : SCREAMING_SNAKE_CASE (ex: `PRIMARY_COLOR`)

Cette architecture permettra un développement TDD efficace et une maintenance aisée du code.
