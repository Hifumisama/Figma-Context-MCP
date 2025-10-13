# FigmAudit - Frontend

> Interface web pour auditer et analyser vos maquettes Figma selon les bonnes pratiques de design

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Développement](#développement)
- [Tests](#tests)
- [Documentation des composants](#documentation-des-composants)
- [Build et déploiement](#build-et-déploiement)
- [Architecture](#architecture)
- [Roadmap](#roadmap)

## 🎯 Aperçu

FigmAudit est une application web React qui permet aux **designers UI/UX** et **développeurs** d'auditer leurs fichiers Figma pour identifier les problèmes de qualité et les opportunités d'amélioration.

**URL de démo** : [https://storage.googleapis.com/figma-mcp-frontend/index.html](https://storage.googleapis.com/figma-mcp-frontend/index.html)

### Public cible

- **Designers UI/UX** : Améliorer la qualité des maquettes et suivre les bonnes pratiques
- **Développeurs** : Vérifier la cohérence du design system avant l'implémentation
- **Équipes produit** : Assurer la maintenabilité des fichiers Figma

## ✨ Fonctionnalités

### 🔍 Audit de maquette

Analysez vos fichiers Figma selon plusieurs règles de bonnes pratiques :
- Utilisation d'Auto Layout
- Nommage des calques
- Styles détachés du design system
- Paramètres d'export manquants
- Calques cachés
- Utilisation appropriée des groupes vs frames

### 📊 Visualisation des résultats

- **Tableau détaillé** : Liste des problèmes détectés par élément
- **Graphique interactif** : Distribution des règles violées avec Chart.js
- **Statistiques globales** : Nombre total de détections par règle

### 🧩 Suggestions de composants

Identifie automatiquement les éléments répétitifs qui pourraient être transformés en composants Figma pour améliorer la réutilisabilité.

### 🎨 Visualisation du Design System

Affiche les styles de votre fichier Figma :
- **Couleurs** : Palette de couleurs utilisées
- **Typographies** : Styles de texte (famille, taille, poids)
- **Strokes** : Styles de bordure
- **Layouts** : Configurations de mise en page

### 🤖 Description IA

Génère une description contextuelle de votre maquette grâce à l'intelligence artificielle.

## 🛠️ Prérequis

- **Node.js** : >= 18.0.0
- **pnpm** : >= 8.0.0 (recommandé pour la gestion des dépendances)

## 📦 Installation

```bash
# Cloner le repository (si pas déjà fait)
cd front

# Installer les dépendances
pnpm install
```

### Configuration

Créez un fichier `.env` à la racine du dossier `front/` :

```env
# URL de l'API backend (optionnel, utilise l'URL de production par défaut)
VITE_API_BASE_URL=http://localhost:3333
```

**Note** : Si `VITE_API_BASE_URL` n'est pas définie, l'application utilisera automatiquement l'URL de production.

## 🚀 Développement

### Lancer le serveur de développement

```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173)

### Vérification de types

```bash
pnpm type-check
```

### Linting et formatage

```bash
# Linter ESLint
pnpm lint

# Formatter avec Prettier
pnpm format
```

## 🧪 Tests

Le projet utilise **Vitest** pour les tests unitaires avec une couverture complète des composants.

```bash
# Exécuter tous les tests
pnpm test

# Tests avec interface UI
pnpm test:ui

# Génération du rapport de couverture
pnpm test:coverage
```

### Fichiers de tests

Les tests sont colocalisés avec les composants :
```
src/
  components/
    MyComponent.tsx
    MyComponent.test.tsx
```

## 📖 Documentation des composants

Le projet utilise **Storybook** pour documenter les composants React de manière interactive.

```bash
# Lancer Storybook en mode développement
pnpm storybook

# Construire Storybook pour la production
pnpm build-storybook
```

Storybook sera accessible sur [http://localhost:6006](http://localhost:6006)

### Organisation des stories

Chaque composant possède sa story :
```
src/
  components/
    MyComponent.tsx
    MyComponent.stories.tsx
    MyComponent.test.tsx
```

## 🏗️ Build et déploiement

### Build de production

```bash
pnpm build
```

Les fichiers compilés seront générés dans le dossier `dist/`.

### Preview du build

```bash
pnpm preview
```

### Configuration de déploiement

Le projet est configuré pour un déploiement sur **Google Cloud Storage** avec :
- Base path : `/figma-mcp-frontend/`
- Optimisations : minification avec esbuild, chunking intelligent
- Proxy API : `/api` → backend (configurable via `BACKEND_URL`)

## 🏛️ Architecture

### Stack technique

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06b6d4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-ff6384?style=flat&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6e9f18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Storybook](https://img.shields.io/badge/Storybook-9.1-ff4785?style=flat&logo=storybook&logoColor=white)](https://storybook.js.org/)

### Structure du projet

```
front/
├── src/
│   ├── components/         # Composants React
│   │   ├── common/        # Composants réutilisables (LoadingSpinner, ErrorDisplay)
│   │   ├── display/       # Composants d'affichage (StatsCards, DetailedTables)
│   │   └── forms/         # Composants de formulaire (InputForm, PrimaryButton)
│   ├── contexts/          # Contextes React (AuditContext)
│   ├── types/             # Types TypeScript
│   ├── utils/             # Utilitaires (api.ts)
│   ├── App.tsx            # Composant racine
│   ├── main.tsx           # Point d'entrée
│   └── app.css            # Styles globaux
├── public/                # Assets statiques
├── .storybook/           # Configuration Storybook
├── vite.config.js        # Configuration Vite
├── tailwind.config.js    # Configuration Tailwind
└── package.json          # Dépendances et scripts
```

### Gestion d'état

L'application utilise un **Context API** personnalisé (`AuditContext`) pour gérer :
- État du formulaire (URL Figma, clé API)
- Résultats d'audit
- Filtres et préférences utilisateur
- État de chargement et erreurs

### Composants principaux

- **InputForm** : Formulaire de saisie URL Figma + clé API
- **StatsCards** : Cartes de statistiques avec graphique Chart.js
- **DetailedTables** : Tableau détaillé des problèmes détectés
- **DesignSystemViewer** : Visualisation du design system
- **ComponentSuggestionsCards** : Suggestions de composants à créer
- **RuleDetails** : Détails d'une règle avec conseils de résolution

## 🗺️ Roadmap

### Version 0.1 (En cours)

- [x] Interface d'audit de base
- [x] Visualisation du design system
- [x] Suggestions de composants
- [x] Tests unitaires complets
- [x] Documentation Storybook

### Version 1.0 (À venir)

- [ ] **Authentification OAuth Figma** : Remplacer l'accès par token manuel par un flux OAuth sécurisé
- [ ] Historique des audits
- [ ] Export des rapports (PDF, CSV)
- [ ] Comparaison de versions
- [ ] Mode collaboratif

## 🧑‍💻 Guide du développeur

Cette section détaille les conventions et patterns à suivre pour contribuer au projet.

### Conventions de nommage

**Fichiers et composants**
- Composants React : `PascalCase` (ex: `StatsCards.tsx`, `InputForm.tsx`)
- Utilitaires : `camelCase` (ex: `api.ts`, `formatters.ts`)
- Contextes : suffixe `Context` (ex: `AuditContext.tsx`)
- Types : `camelCase` (ex: `audit.ts`, `common.ts`)

**Structure d'un composant**

Chaque composant suit cette organisation :
```
ComponentName.tsx         # Composant principal
ComponentName.test.tsx    # Tests unitaires Vitest
ComponentName.stories.tsx # Documentation Storybook
```

**Organisation des imports**

Toujours structurer les imports dans cet ordre :
```typescript
// 1. React et librairies externes
import React from 'react';
import { marked } from 'marked';

// 2. Contextes et hooks custom
import { useAudit } from '../../contexts/AuditContext';

// 3. Composants locaux
import RuleBadge from './RuleBadge';
import PrimaryButton from './PrimaryButton';

// 4. Utilitaires
import { auditFigmaDesign, isValidFigmaUrl } from '../../utils/api';

// 5. Types
import type { RuleDefinition, AuditResult } from '../../types/audit';
```

### Design System Tailwind

Le projet utilise des tokens custom définis dans `tailwind.config.js` :

**Couleurs Figma**
```css
bg-figma-background   /* #081028 - Fond principal de l'app */
bg-figma-card         /* #0B1739 - Fond des cartes */
bg-figma-button       /* #CB3CFF - Couleur primaire des boutons */
text-figma-text       /* #FFFFFF - Texte principal */
text-figma-textMuted  /* #AEB9E1 - Texte secondaire */
text-figma-components /* #D9E1FA - Texte pour les composants */
```

**Couleurs primaires**
```css
bg-primary-500  /* #4570ea - Couleur primaire par défaut */
bg-primary      /* #CB3CFF - Couleur primaire custom */
```

**Typographies**
```css
font-sans  /* Work Sans - Titre et textes importants */
font-body  /* Roboto - Corps de texte */
```

**Animations custom**
```css
animate-pulse-progress  /* Animation de progression pour les loaders */
```

### Pattern : Créer un nouveau composant display

Les composants `display/` affichent des données depuis le contexte sans logique métier.

```typescript
// src/components/display/MyNewComponent.tsx
import React from 'react';
import { useAudit } from '../../contexts/AuditContext';

interface MyNewComponentProps {
  title?: string;
}

const MyNewComponent: React.FC<MyNewComponentProps> = ({
  title = 'Default Title'
}) => {
  const { state, getRuleById } = useAudit();

  if (!state.results) {
    return null;
  }

  return (
    <div className="bg-figma-card rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-figma-text">
        {title}
      </h2>

      <div className="space-y-2">
        {/* Votre contenu ici */}
      </div>
    </div>
  );
};

export default MyNewComponent;
```

### Pattern : Utiliser le AuditContext

Le contexte centralise toute la logique d'état de l'application.

**Accéder aux données**
```typescript
import { useAudit } from '../contexts/AuditContext';

const MyComponent = () => {
  const {
    state,                    // État complet
    getRuleById,              // Récupérer une règle par ID
    allRulesWithStatus,       // Toutes les règles avec compteurs
    showReport,               // Booléen : afficher le rapport ?
    chartData,                // Données formatées pour Chart.js
    getFilteredReportData     // Données filtrées
  } = useAudit();

  const rule = getRuleById(1);
  const hasResults = showReport();

  return (/* JSX */);
};
```

**Modifier l'état**
```typescript
const {
  setFigmaUrl,           // Mettre à jour l'URL
  setFigmaApiKey,        // Mettre à jour la clé API
  setLoading,            // Activer/désactiver le loading
  setError,              // Définir une erreur
  setResults,            // Enregistrer les résultats d'audit
  toggleRuleFilter,      // Ajouter/retirer un filtre
  clearAllFilters,       // Réinitialiser les filtres
  toggleCompliantRules,  // Afficher/masquer les règles conformes
  resetAudit             // Réinitialiser complètement l'état
} = useAudit();
```

### Pattern : Appels API

Tous les appels API passent par `utils/api.ts`.

```typescript
import { auditFigmaDesign, isValidFigmaUrl, ApiError } from '../../utils/api';

const handleAudit = async () => {
  // 1. Validation
  if (!isValidFigmaUrl(figmaUrl)) {
    setError('URL Figma invalide');
    return;
  }

  // 2. Loading
  setLoading(true);

  try {
    // 3. Appel API
    const results = await auditFigmaDesign({
      figmaUrl,
      figmaApiKey,
      outputFormat: 'json'
    });

    // 4. Succès
    setResults(results);
  } catch (error) {
    // 5. Gestion d'erreur
    if (error instanceof ApiError) {
      const userMessage = error.getUserMessage();
      setError(`${userMessage.title}: ${userMessage.message}`);
    } else {
      setError('Une erreur inattendue est survenue');
    }
  }
};
```

### Tests avec Vitest

**Pattern de test standard**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders with default props', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const { user } = render(<MyComponent />);
    const button = screen.getByRole('button');

    await user.click(button);

    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

**Seuils de couverture**
- Lignes : 70% minimum
- Fonctions : 70% minimum
- Branches : 70% minimum
- Statements : 70% minimum

**Ce qui doit être testé**
- ✅ Rendu par défaut
- ✅ Props customisées
- ✅ Interactions utilisateur (clicks, inputs)
- ✅ États conditionnels
- ✅ Gestion d'erreurs

**Ce qui peut être ignoré**
- ❌ Composants purement visuels sans logique
- ❌ Stories Storybook
- ❌ Fichiers de configuration
- ❌ Types TypeScript

### Storybook

**Pattern de story standard**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import MyComponent from './MyComponent';

const meta = {
  title: 'Category/MyComponent',  // Ex: Forms/PrimaryButton
  component: MyComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description détaillée du composant',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    propName: {
      control: 'text',
      description: 'Description de la prop',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'default value'" },
      },
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories obligatoires
export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {
    propName: 'custom value',
  },
};

// Stories pour les états spécifiques
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    error: 'Something went wrong',
  },
};
```

**Catégories Storybook**
- `Common/` : Composants réutilisables (LoadingSpinner, ErrorDisplay)
- `Forms/` : Composants de formulaire (InputForm, PrimaryButton)
- `Display/` : Composants d'affichage de données (StatsCards, DetailedTables)

### TypeScript

**Mode strict activé**
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

**Types vs Interfaces**
- Utiliser `interface` pour les props de composants
- Utiliser `type` pour les unions, intersections, et types complexes

```typescript
// ✅ Props de composants
interface MyComponentProps {
  title: string;
  count?: number;
}

// ✅ Types complexes
type RuleCategory = 'standard' | 'ai-based';
type AuditState = {
  isLoading: boolean;
  error: string | null;
};
```

### Gestion d'erreur

**Pattern standard**
```typescript
try {
  const result = await someAsyncOperation();
  handleSuccess(result);
} catch (error) {
  if (error instanceof ApiError) {
    // Erreur API structurée
    const userMessage = error.getUserMessage();
    setError(`${userMessage.title}: ${userMessage.message}`);
  } else if (error instanceof Error) {
    // Erreur JavaScript standard
    setError(error.message);
  } else {
    // Erreur inconnue
    setError('Une erreur inattendue est survenue');
  }
}
```

### Performance

**Optimisations React**
- Utiliser `useMemo` pour les calculs coûteux
- Utiliser `useCallback` pour les fonctions passées en props
- Le `AuditContext` est déjà optimisé avec `useMemo` et `useCallback`

**Tailwind CSS**
- Éviter les styles inline dynamiques sauf nécessaire
- Préférer les classes utilitaires Tailwind
- Pour les couleurs dynamiques, utiliser `style={{ backgroundColor: color }}`

### Checklist avant PR

- [ ] Le code compile sans erreur TypeScript (`pnpm type-check`)
- [ ] Le linter passe sans erreur (`pnpm lint`)
- [ ] Le code est formaté avec Prettier (`pnpm format`)
- [ ] Les tests passent (`pnpm test`)
- [ ] Une story Storybook existe pour le nouveau composant
- [ ] Les tokens Tailwind custom sont utilisés plutôt que des couleurs brutes
- [ ] Les imports sont organisés dans le bon ordre
- [ ] Le composant utilise le `AuditContext` si besoin d'accéder aux données

## 📝 License

Ce projet fait partie de l'écosystème **Figma Context MCP**. Référez-vous au README principal pour plus d'informations sur la licence.

## 🔗 Liens utiles

- [Documentation Vite](https://vitejs.dev/)
- [Documentation React](https://react.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [Documentation Storybook](https://storybook.js.org/)
- [Documentation Vitest](https://vitest.dev/)

---

**Développé avec ❤️ pour améliorer la qualité des designs Figma**
