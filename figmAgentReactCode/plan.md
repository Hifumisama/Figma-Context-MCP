# Plan POC - Mega Agent Figma to React
## Proof of Concept : Validation du concept avec un agent unique

---

## 🎯 Objectif du POC

Valider le concept **end-to-end** avec un **Mega Agent unique** avant de considérer un split en plusieurs agents spécialisés.

**Priorités** :
1. 💰 **Coût en tokens** - Optimiser la consommation
2. ⚡ **Vitesse d'exécution** - Pipeline rapide
3. 🎨 **Qualité du code** - Code React propre et maintenable
4. 🛠️ **Maintenabilité** - Architecture simple et évolutive

**Cible** : Apps moyennes (5-20 composants) avec possibilité d'évolution

---

## 📋 Architecture POC

### Principe : Un Seul Mega Agent

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           🤖 MEGA AGENT                             │
│           "FigmaToReactAgent"                       │
│                                                     │
│  Responsabilités :                                  │
│  1. Analyse du design system Figma                  │
│  2. Création de la structure projet React           │
│  3. Génération de tous les composants               │
│  4. Écriture des tests                              │
│  5. Build et validation                             │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        │ Utilise
                        ↓
        ┌───────────────────────────────┐
        │      MCP Servers              │
        ├───────────────────────────────┤
        │ • Filesystem (officiel)       │
        │ • Figma Context (custom)      │
        └───────────────────────────────┘
                        │
                        │ Et
                        ↓
        ┌───────────────────────────────┐
        │    VoltAgent Tools            │
        ├───────────────────────────────┤
        │ • run_npm_install             │
        │ • run_tests                   │
        │ • build_project               │
        │ • lint_code                   │
        │ • intelligent_diff (IA)       │
        │ • detect_missing_deps (IA)    │
        │ • generate_skeleton (IA)      │
        └───────────────────────────────┘
```

---

## 🔧 Stack Technique

### MCP Servers (Réutilisation de l'existant)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "./workspace"
      ]
    },
    "figma": {
      "command": "node",
      "args": ["./mcp-figma/index.js"]
    }
  }
}
```

### VoltAgent Tools (7 tools custom)

#### 1. Tools Commandes NPM (Boîtes noires)

**Principe** : Exécution simple, retour OK/KO, pas de logs verbeux

```typescript
// Tool 1: run_npm_install
{
  name: "run_npm_install",
  description: "Installe les dépendances npm (npm install)",
  parameters: {
    projectPath: string,
  },
  output: {
    success: boolean,
    message: string, // "✅ Dependencies installed" ou erreur
  }
}

// Tool 2: run_tests
{
  name: "run_tests",
  description: "Lance les tests (npm test). Retourne uniquement le résumé.",
  parameters: {
    projectPath: string,
    testFile?: string, // Optionnel : tester un fichier précis
  },
  output: {
    success: boolean,
    summary: string, // ex: "✅ 5/5 tests passed"
    failedTests: string[], // Liste des tests échoués si applicable
  }
}

// Tool 3: build_project
{
  name: "build_project",
  description: "Build le projet (npm run build). Retourne OK/KO.",
  parameters: {
    projectPath: string,
  },
  output: {
    success: boolean,
    message: string, // "✅ Build successful" ou erreur principale
  }
}

// Tool 4: lint_code
{
  name: "lint_code",
  description: "Lance ESLint. Retourne les erreurs critiques seulement.",
  parameters: {
    projectPath: string,
    autoFix?: boolean,
  },
  output: {
    success: boolean,
    errorsCount: number,
    topErrors: string[], // Maximum 5 premières erreurs
  }
}
```

#### 2. Meta-Tools IA (Analyse intelligente)

**Principe** : Ces tools appellent un LLM (Gemini Flash) pour faire de l'analyse

```typescript
// Tool 5: intelligent_diff
{
  name: "intelligent_diff",
  description: "Compare un composant Figma avec le code React existant (via IA)",
  parameters: {
    figmaComponent: object,
    reactCode: string,
  },
  output: {
    needsUpdate: boolean,
    changes: string[], // Liste des modifications nécessaires
  }
}

// Tool 6: detect_missing_deps
{
  name: "detect_missing_deps",
  description: "Analyse le code et détecte les packages npm manquants (via IA)",
  parameters: {
    code: string,
    packageJson: string,
  },
  output: {
    missingPackages: string[], // ex: ["lucide-react", "clsx"]
  }
}

// Tool 7: generate_skeleton
{
  name: "generate_skeleton",
  description: "Génère un squelette de composant React depuis des specs (via IA)",
  parameters: {
    componentName: string,
    specs: string, // Description en langage naturel ou JSON
  },
  output: {
    code: string, // Code du composant généré
  }
}
```

---

## 🤖 Mega Agent : Instructions

```typescript
const megaFigmaAgent = {
  name: "FigmaToReactMegaAgent",
  model: "gemini-2.0-flash-exp", // Économique et performant
  
  instructions: `
    Tu es un expert React spécialisé dans la transformation de designs Figma en code React de production.
    
    **Ton objectif** : Transformer un design Figma en application React fonctionnelle.
    
    **Ressources disponibles** :
    - MCP Filesystem : lecture/écriture de fichiers
    - MCP Figma : accès au JSON Figma (design system, composants)
    - Tools NPM : installation, tests, build, lint
    - Meta-tools IA : analyse intelligente, génération de code
    
    **Processus à suivre** :
    
    1. **Analyse du Design System**
       - Récupère le JSON Figma via MCP
       - Identifie les tokens (colors, typography, spacing)
       - Liste tous les composants à créer
    
    2. **Initialisation du Projet**
       - Crée la structure du projet React (via filesystem MCP)
       - Génère le fichier de design tokens
       - Configure les dépendances de base
       - Lance run_npm_install
    
    3. **Génération des Composants** (itératif)
       Pour chaque composant Figma :
       - Vérifie si le composant existe déjà (via filesystem MCP)
       - Si existe : utilise intelligent_diff pour voir s'il faut l'update
       - Si n'existe pas ou besoin d'update :
         - Génère le code avec generate_skeleton
         - Écrit le fichier (via filesystem MCP)
         - Génère le test associé
    
    4. **Détection des Dépendances Manquantes**
       - Pour chaque composant généré, utilise detect_missing_deps
       - Si des packages manquent, les ajouter au package.json
       - Lance run_npm_install si nécessaire
    
    5. **Validation**
       - Lance run_tests pour vérifier que tout fonctionne
       - Si échec : debug et corrige
       - Lance build_project pour valider le build
       - Lance lint_code pour la qualité
    
    **Règles importantes** :
    - Travaille étape par étape, valide chaque étape avant de passer à la suivante
    - Utilise les meta-tools IA pour les tâches d'analyse complexes
    - Limite les logs : les tools npm retournent déjà des résumés
    - En cas d'erreur, analyse et corrige avant de continuer
    - Privilégie la qualité à la quantité : mieux vaut 3 composants parfaits que 10 buggés
  `,
  
  maxSteps: 100, // Laisse de la marge pour les projets moyens
};
```

---

## 📊 Workflow Simplifié

```
┌─────────────────────────────────────────────┐
│ 1. Input : URL Figma                        │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ 2. Récupération données Figma (MCP)         │
│    → JSON avec composants, design tokens    │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ 3. Analyse & Planning                       │
│    → Liste des composants à créer           │
│    → Design system tokens                   │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ 4. Init Projet React                        │
│    → Structure dossiers (MCP filesystem)    │
│    → package.json                           │
│    → run_npm_install                        │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ 5. Génération Composants (boucle)           │
│    Pour chaque composant :                  │
│    → intelligent_diff (si existe)           │
│    → generate_skeleton                      │
│    → Écriture fichier (MCP filesystem)      │
│    → detect_missing_deps                    │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ 6. Tests & Validation                       │
│    → run_tests                              │
│    → build_project                          │
│    → lint_code                              │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ 7. Output : Projet React fonctionnel ✅     │
└─────────────────────────────────────────────┘
```

---

## 📏 Métriques à Tracker

Pour **décider** si un split en plusieurs agents est nécessaire, on track :

```typescript
interface POCMetrics {
  // Globales
  totalTokens: number;
  totalTime: number; // en secondes
  componentsGenerated: number;
  
  // Par étape (détection des goulets)
  steps: Array<{
    name: string; // ex: "Génération Button"
    tokens: number;
    time: number;
    success: boolean;
  }>;
  
  // Qualité
  testsPass: boolean;
  buildSuccess: boolean;
  lintErrors: number;
}
```

**Objectifs POC** :
- ✅ Temps total < 5 min pour 5 composants simples
- ✅ Tokens < 50K pour 5 composants simples
- ✅ Tests passent à 100%
- ✅ Build réussit sans erreurs
- ✅ Lint errors < 10

---

## 🎯 Cas de Test

### Test 1 : Projet Simple (3-5 composants)
- **Input** : Landing page Figma avec Button, Card, Hero
- **Attendu** : Projet React + Vite avec les 3 composants + tests
- **Budget** : < 30K tokens, < 3 min

### Test 2 : Projet Moyen (10-15 composants)
- **Input** : Dashboard Figma avec Sidebar, Header, Table, Charts, etc.
- **Attendu** : Projet React fonctionnel avec routing
- **Budget** : < 80K tokens, < 10 min

### Test 3 : Update d'un Composant
- **Input** : Button existant + nouvelle version Figma
- **Attendu** : Détection des changements + update du code
- **Budget** : < 5K tokens, < 1 min

---

## 🔄 Plan d'Action

### Phase 1 : Setup (Jour 1)
- [ ] Installer VoltAgent dans le projet
- [ ] Configurer les 2 MCP (filesystem + figma)
- [ ] Créer les 7 tools VoltAgent
- [ ] Tester chaque tool isolément

### Phase 2 : Mega Agent (Jour 2-3)
- [ ] Créer le Mega Agent avec les instructions complètes
- [ ] Tester sur un projet Figma ultra-simple (1 composant)
- [ ] Debugger et ajuster les instructions
- [ ] Valider le workflow end-to-end

### Phase 3 : Tests Réels (Jour 4-5)
- [ ] Test 1 : Projet simple (3-5 composants)
- [ ] Mesurer les métriques (tokens, temps, qualité)
- [ ] Test 2 : Projet moyen (10-15 composants)
- [ ] Test 3 : Update de composant
- [ ] Analyser les résultats

### Phase 4 : Décision (Jour 6)
- [ ] Analyser les logs et métriques
- [ ] Identifier les goulets (étapes coûteuses/lentes)
- [ ] **Décider** : garder le Mega Agent ou split ?
- [ ] Si split nécessaire : définir les agents à extraire

---

## 🚦 Critères de Décision : Split ou Pas ?

### ✅ **Garder le Mega Agent SI** :
- Tokens < 50K pour un projet moyen
- Temps < 10 min pour un projet moyen
- Qualité du code satisfaisante
- Peu d'erreurs à debugger

### ✂️ **Split en Agents SI** :
- Une étape consomme > 30% des tokens totaux
- Une étape se répète souvent (ex: génération composants)
- Besoin de tester/debugger des parties isolément
- Tokens > 80K pour un projet moyen
- Certaines étapes pourraient être parallélisées

### 🎯 **Agents Candidats au Split** (si nécessaire) :
1. **ProjectArchitect** : Analyse initiale + Design system
2. **ComponentDeveloper** : Génération d'un composant (réutilisable N fois)
3. **BuildEngineer** : Tests + Build + Lint final

---

## 📝 Notes Importantes

### Whitelist des Commandes NPM
Les tools ne peuvent exécuter QUE ces commandes :
- `npm install`
- `npm test`
- `npm run build`
- `npm run lint`
- `npm run lint -- --fix`
- `npm run dev`

**Sécurité** : Aucune commande arbitraire n'est autorisée.

### Meta-Tools IA
Les tools `intelligent_diff`, `detect_missing_deps`, et `generate_skeleton` appellent **Gemini Flash** en interne pour l'analyse.

**Avantage** : Flexibilité + Coût réduit (Flash est cheap)

### MCP Filesystem
Toujours travailler dans `./workspace` pour isoler les projets générés.

---

## 🎓 Prochaines Étapes Après le POC

Si le POC valide le concept :
1. Optimiser les prompts des meta-tools
2. Ajouter des tests unitaires sur les tools
3. Gérer les cas d'erreur (retry, fallback)
4. Documenter les best practices
5. Si nécessaire : split en agents spécialisés

Si le POC échoue ou montre des limites :
1. Identifier les problèmes précis
2. Ajuster l'architecture (peut-être split immédiat)
3. Re-tester avec une approche différente

---

## ✅ Checklist de Validation POC

- [ ] Le Mega Agent génère un projet React fonctionnel
- [ ] Les tests passent à 100%
- [ ] Le build réussit
- [ ] Le code est maintenable (pas de code spaghetti)
- [ ] Les métriques sont satisfaisantes (tokens, temps)
- [ ] On peut update un composant existant facilement
- [ ] La qualité du code généré est acceptable

---

**Date de création** : 24 octobre 2025
**Statut** : 🚧 POC en cours