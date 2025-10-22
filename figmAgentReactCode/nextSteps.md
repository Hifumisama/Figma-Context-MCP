# Next Steps - VoltAgent Figma to React Pipeline

## 📋 État actuel du projet

### ✅ Ce qui a été réalisé

1. **Structure de base mise en place**
   - Configuration VoltAgent avec Google Generative AI
   - Connexion au serveur MCP Figma (localhost:3333)
   - Système de mémoire contextuelle (LibSQL)
   - Architecture agents + workflows + tools

2. **Tools créés**
   - `fetchAndValidateFigmaTool` - Récupère les données Figma depuis MCP
   - `readFileTool` - Lit des fichiers
   - `writeFileTool` - Écrit des fichiers
   - `runBashCommandTool` - Exécute des commandes shell (CMD sur Windows)
   - `searchFilesTool` - Recherche de fichiers par glob pattern
   - `createDirectoryTool` - Crée des dossiers

3. **Premier agent créé**
   - `project-architect` - Agent généraliste pour l'initialisation du projet
   - Accès à tous les tools filesystem
   - Instructions détaillées (peut-être trop !)

### ❌ Problèmes identifiés

1. **Agent trop verbeux**
   - L'agent essaie de tout expliquer dans ses réponses
   - Consommation excessive de tokens
   - Logique trop complexe dans un seul agent

2. **Tools trop génériques**
   - `runBashCommandTool` permet d'exécuter N'IMPORTE quelle commande
   - Pas de contrôle sur ce qui est exécuté
   - Difficile de guider l'agent vers les bonnes actions

3. **Manque de découpage**
   - Un seul agent fait trop de choses (analyse + init + config)
   - Logique métier mélangée avec l'orchestration
   - Difficile à déboguer et à maintenir

---

## 🎯 Nouvelle philosophie de développement

### Principe 1 : UN agent orchestrateur + Tools spécialisés

**Avant :**
```
Agent "Project Architect" (agent monolithique)
├── Analyse la structure Figma (logique dans l'agent)
├── Crée l'architecture du projet (logique dans l'agent)
├── Initialise Vite (logique dans l'agent)
├── Configure Tailwind (logique dans l'agent)
└── Génère les fichiers de config (logique dans l'agent)

→ L'agent doit tout savoir, tout comprendre, tout faire
→ Instructions ultra-longues, tokens gaspillés
```

**Après :**
```
Agent "Project Architect" (orchestrateur simple)
├── Tool: analyzeFigmaStructure → Retourne { componentsOrder, atomicDesign }
├── Tool: createReactProject → Retourne { projectPath }
├── Tool: extractDesignTokens → Retourne { colors, fonts, spacing }
├── Tool: generateTailwindConfig → Retourne { configPath }
└── Tool: createAtomicStructure → Retourne { foldersCreated }

→ L'agent orchestre, les tools font le travail
→ Instructions courtes, logique métier isolée
```

**Avantages :**
- Agent simple = Instructions courtes
- Logique métier testable indépendamment
- Tools réutilisables dans d'autres agents
- Moins de tokens gaspillés (pas de verbiage)
- Plus facile à déboguer (un tool = une fonction)

---

### Principe 2 : Logique métier = Tools spécialisés

**Avant :**
```typescript
// Tool générique
runBashCommandTool({
  command: "npm create vite@latest project -- --template react-ts",
  cwd: "workspace"
})
// L'agent doit connaître la commande exacte
```

**Après :**
```typescript
// Tool spécialisé (SANS LLM)
createReactProjectTool({
  projectName: "my-app",
  targetDir: "workspace",
  template: "react-ts"
})

// Implémentation du tool :
export const createReactProjectTool = createTool({
  name: "create_react_project",
  description: "Initialize a new React project with Vite",
  parameters: z.object({
    projectName: z.string(),
    targetDir: z.string(),
    template: z.enum(["react", "react-ts"]),
  }),
  execute: async ({ projectName, targetDir, template }) => {
    // Logique simple, SANS LLM
    const command = `npm create vite@latest ${projectName} -- --template ${template}`;
    const { stdout } = await execAsync(command, { cwd: targetDir });

    return {
      success: true,
      projectPath: path.join(targetDir, projectName)
    };
  }
});
```

**Avantages :**
- Logique métier isolée dans le tool
- Pas besoin que l'agent connaisse les détails
- Validation des paramètres avec Zod
- Réutilisable partout
- **AUCUN TOKEN LLM utilisé** pour cette logique

---

### Principe 3 : Tools = Mini-agents sans LLM

Un bon tool doit :

✅ **Faire UNE seule chose**
```typescript
// ✅ BON
createTailwindConfigTool({ colors, fonts, spacing })

// ❌ MAUVAIS
setupProjectConfigurationTool({ /* 20 paramètres */ })
```

✅ **Avoir une logique déterministe** (pas de LLM)
```typescript
// ✅ BON - Logique simple
execute: async ({ colors }) => {
  const config = `
    export default {
      theme: {
        extend: {
          colors: ${JSON.stringify(colors)}
        }
      }
    }
  `;
  await writeFile('tailwind.config.js', config);
  return { success: true };
}

// ❌ MAUVAIS - Appel LLM dans un tool
execute: async ({ figmaData }) => {
  const llmResponse = await llm.generate("Analyze this Figma data...");
  // ...
}
```

✅ **Retourner UNIQUEMENT ce qui est nécessaire**
```typescript
// ✅ BON
return { success: true, projectPath: "/workspace/project" }

// ❌ MAUVAIS - Trop verbeux
return {
  success: true,
  message: "The project has been successfully created...",
  details: "First I created the directory, then I ran npm...",
  logs: ["Step 1...", "Step 2..."],
  // ...
}
```

---

## 🔧 Plan de refactoring

### Étape 1 : Garder UN SEUL agent, découper en tools

**Architecture cible :**

```
Agent "Project Architect" (orchestrateur)
├── Instructions simples : "Initialize a React project from Figma design"
├── Workflow : fetch → analyze → init → config → structure
└── Tools spécialisés :
    ├── fetchAndValidateFigmaTool ✅ (déjà fait)
    ├── analyzeFigmaStructureTool (à créer)
    ├── createReactProjectTool (à créer)
    ├── extractDesignTokensTool (à créer)
    ├── generateTailwindConfigTool (à créer)
    └── createAtomicStructureTool (à créer)
```

**Principe :**
- L'agent n'a PAS besoin d'instructions détaillées
- Chaque tool contient la logique métier
- L'agent décide juste QUAND appeler QUEL tool
- Les tools sont SANS LLM (logique pure TypeScript)

### Étape 2 : Créer des tools spécialisés

**Remplacer les tools génériques par des tools métier :**

```typescript
// Tools filesystem génériques → GARDER pour des cas simples
readFileTool
writeFileTool
createDirectoryTool

// Tool générique → REMPLACER par des tools spécialisés
runBashCommandTool → SUPPRIMER

// Nouveaux tools spécialisés
createReactProjectTool
installDependenciesTool
generateTailwindConfigTool
extractDesignTokensTool
createAtomicStructureTool
```

### Étape 3 : Simplifier les instructions de l'agent

**Avant (trop verbeux) :**
```typescript
instructions: `
  Tu es l'Architecte de Projet React...

  Phase 1: Récupération des données Figma
  - Utilise le tool fetch_and_validate_figma
  - Analyse les nœuds INSTANCE, COMPONENT, FRAME
  - ...

  Phase 2: Analyse de la structure
  - Identifier les composants en analysant...
  - Classer selon Atomic Design...
  - ...

  [10 pages d'instructions...]
`
```

**Après (simple et clair) :**
```typescript
instructions: `
  You are a React Project Architect.

  Your goal: Initialize a complete React project from Figma design data.

  Workflow:
  1. Use fetchAndValidateFigma to get Figma data
  2. Use analyzeFigmaStructure to classify components
  3. Use createReactProject to initialize Vite
  4. Use extractDesignTokens to get colors/fonts/spacing
  5. Use generateTailwindConfig to create tailwind.config.js
  6. Use createAtomicStructure to create folders (atoms/molecules/organisms)

  Output: A ready-to-code React project with Tailwind configured.
`
```

**Remarque :** L'agent n'a plus besoin de savoir COMMENT faire chaque étape,
juste QUELLE étape faire dans quel ordre. La logique est dans les tools.

---

## 🚀 Prochaines actions

### Immédiat (Semaine 1)

1. **Créer le tool `analyzeFigmaStructureTool`**
   - Entrée : Figma JSON (nodes, components)
   - Logique : Parcourir l'arbre, classifier selon Atomic Design
   - Sortie : { componentsOrder: string[], atomicDesign: Record<string, "atom"|"molecule"|"organism"> }
   - SANS LLM (algorithme déterministe)

2. **Créer le tool `createReactProjectTool`**
   - Entrée : { projectName, targetDir, template }
   - Logique : Exécuter `npm create vite@latest`
   - Sortie : { success: true, projectPath: "workspace/project" }
   - SANS LLM (juste exec de commande)

3. **Créer le tool `extractDesignTokensTool`**
   - Entrée : globalVars.designSystem
   - Logique : Mapper les tokens Figma vers format Tailwind
   - Sortie : { colors, fonts, spacing }
   - SANS LLM (transformation JSON → JSON)

4. **Simplifier les instructions de `project-architect`**
   - Supprimer les 10 pages d'explications
   - Garder juste : "Use these tools in order: 1, 2, 3..."
   - L'agent orchestre, les tools font le travail

5. **Tester le workflow minimal**
   ```
   Agent project-architect
   └─> fetchAndValidateFigma (MCP)
   └─> analyzeFigmaStructure (tool)
   └─> createReactProject (tool)
   ```

### Court terme (Semaine 2-3)

1. **Créer les tools pour le design system**
   - `generateTailwindConfigTool` : Génère tailwind.config.js depuis tokens
   - `createAtomicStructureTool` : Crée dossiers atoms/molecules/organisms
   - `installDependenciesTool` : Installe npm packages (Tailwind, etc.)

2. **Ajouter ces tools à l'agent `project-architect`**
   - L'agent les utilise après `createReactProject`
   - Toujours UN SEUL agent, plus de tools

3. **Compléter le workflow Phase 1**
   ```
   Agent project-architect
   └─> fetchAndValidateFigma
   └─> analyzeFigmaStructure
   └─> createReactProject
   └─> extractDesignTokens
   └─> generateTailwindConfig
   └─> createAtomicStructure
   ```

### Moyen terme (Semaine 4-6)

**Option A : Garder un seul agent avec ENCORE PLUS de tools**
```
Agent project-architect (fait TOUT)
├── Phase 1 tools (init)
├── Phase 2 tools (tests)
└── Phase 3 tools (components)
```

**Option B : Créer d'autres agents spécialisés**
- `component-developer` : Génère les composants React
- `test-engineer` : Crée et exécute les tests

**Recommandation : Commencer avec Option A**
- Un agent orchestrateur avec beaucoup de tools
- Si l'agent devient trop complexe → Découper en plusieurs agents
- Mais toujours la même philosophie : logique = tools, pas instructions

---

## 📐 Règles de design

### Pour l'agent orchestrateur

1. **Instructions = Workflow simple**
   - Pas de détails sur COMMENT faire
   - Juste la SÉQUENCE des tools à utiliser
   - Exemple : "Use fetchAndValidateFigma, then analyzeFigmaStructure, then createReactProject"

2. **Pas d'exemples de code dans les instructions**
   - L'agent orchestre, il ne code pas
   - La logique est dans les tools
   - Les exemples sont dans la description des tools

3. **L'agent décide QUAND, pas COMMENT**
   - Il choisit quel tool appeler selon le contexte
   - Il passe les bons paramètres entre les tools
   - Il gère les erreurs et décide de la suite

### Pour les tools

1. **Nom = Verbe + Nom**
   - `createReactProject`
   - `extractDesignTokens`
   - `generateTailwindConfig`

2. **Description = Quoi + Quand**
   - "Create a new React project with Vite. Use this when you need to initialize the project structure."

3. **Paramètres = Ce qui varie**
   - ✅ `projectName`, `template`, `targetDir`
   - ❌ Pas de paramètre "command" générique

4. **Retour = Données utiles uniquement**
   - ✅ `{ success: true, projectPath: "..." }`
   - ❌ Pas de logs, pas de messages verbeux

---

## 📊 Métriques de succès

Pour valider que la refactorisation fonctionne, on doit observer :

1. **Tokens par agent**
   - Avant : ~5000 tokens par exécution
   - Après : <1000 tokens par exécution

2. **Temps d'exécution**
   - Avant : 30s par agent (à cause des retours verbeux)
   - Après : <10s par agent

3. **Taux de réussite**
   - Avant : ~60% (agent se perd dans la complexité)
   - Après : >90% (tâche simple = moins d'erreurs)

4. **Nombre de steps**
   - Avant : maxSteps=10 (agent fait beaucoup d'aller-retours)
   - Après : maxSteps=3 (agent termine rapidement)

---

## 💡 Concept clé : L'agent orchestre, les tools exécutent

### Analogie avec l'architecture logicielle

**Agent = Chef d'orchestre**
- Voit la partition (les données Figma)
- Décide quand chaque musicien (tool) doit jouer
- Coordonne l'ensemble pour créer la symphonie (le projet React)
- Ne joue PAS d'instrument lui-même

**Tools = Musiciens spécialisés**
- Chacun maîtrise SON instrument (une tâche précise)
- Exécute quand le chef le demande
- Ne décide PAS de la partition
- Fait juste son travail, bien

**Instructions de l'agent = Partition**
- Simple : "D'abord le violon, puis le piano, puis tous ensemble"
- Pas de détails techniques sur comment jouer chaque note
- Juste l'ordre et le moment

### Concrètement

```typescript
// ❌ AVANT - Agent monolithique
instructions: `
  Pour créer le projet React :
  1. Crée le dossier workspace/project/
  2. Exécute cette commande exacte : npm create vite@latest project -- --template react-ts
  3. Va dans le dossier avec cd workspace/project
  4. Lance npm install
  5. Ensuite installe Tailwind avec npm install tailwindcss postcss autoprefixer
  [... 50 lignes de plus ...]
`
// → L'agent essaie de tout faire, se perd, gaspille des tokens

// ✅ APRÈS - Agent orchestrateur
instructions: `
  Initialize a React project from Figma design.

  Workflow:
  1. fetchAndValidateFigma
  2. analyzeFigmaStructure
  3. createReactProject
  4. extractDesignTokens
  5. generateTailwindConfig
  6. createAtomicStructure
`
// → L'agent orchestre, les tools font le travail
```

### Avantages de cette approche

1. **Moins de tokens** : Instructions courtes = moins de contexte à chaque appel LLM
2. **Plus fiable** : Logique déterministe (tools) > Logique LLM (agent)
3. **Testable** : Chaque tool peut être testé indépendamment
4. **Réutilisable** : Les tools peuvent servir à d'autres agents
5. **Débogable** : Un tool plante → on sait exactement où

---

## 🎓 Leçons apprises

### Ce qui fonctionne

✅ **Tools filesystem simples** (read, write, create_directory)
✅ **Connexion MCP Figma** (fetch_and_validate_figma)
✅ **Structure projet** (agents/, tools/, workflows/)
✅ **Validation Zod** pour les schémas

### Ce qui ne fonctionne pas

❌ **Agent "fait-tout"** (trop complexe, trop verbeux)
❌ **Tool générique runBashCommand** (trop de possibilités)
❌ **Instructions longues** (l'agent se perd)
❌ **Retours verbeux** (gaspillage de tokens)

### Principes à retenir

1. **Simplicité > Généricité**
   - Un tool spécialisé est mieux qu'un tool générique

2. **Logique métier ∉ LLM**
   - La logique déterministe va dans les tools
   - L'agent orchestre, ne code pas

3. **Mini-agents = Tools**
   - Chaque tool est un "sous-agent" sans LLM
   - L'agent principal délègue via les tools

4. **Moins de tokens = Plus de succès**
   - Instructions courtes
   - Retours concis
   - Pas d'exemples de code inutiles

---

## 📚 Références

- **VoltAgent Docs** : https://voltagent.dev/docs/
- **Plan détaillé** : `plan.md`
- **Guidelines** : `CLAUDE.md`

---

## 📊 Architecture finale visée

```
┌─────────────────────────────────────────────────────────────┐
│                  Agent "Project Architect"                  │
│                    (Orchestrateur LLM)                      │
│                                                             │
│  Instructions courtes :                                     │
│  "Initialize React project from Figma design"               │
│  "Use tools in sequence: 1→2→3→4→5→6"                      │
│                                                             │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Décide QUAND appeler chaque tool
             │
    ┌────────┴─────────┬──────────┬──────────┬─────────┐
    │                  │          │          │         │
    ▼                  ▼          ▼          ▼         ▼
┌─────────┐      ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Tool 1  │      │ Tool 2  │  │ Tool 3  │  │ Tool 4  │  │ Tool 5  │
│ fetch   │──┐   │ analyze │  │ create  │  │ extract │  │generate │
│ Figma   │  │   │ Figma   │  │ React   │  │ tokens  │  │Tailwind │
└─────────┘  │   └─────────┘  └─────────┘  └─────────┘  └─────────┘
             │
             │ Chaque tool :
             │ - Logique SANS LLM (TypeScript pur)
             │ - Retour concis (JSON structuré)
             │ - Une seule responsabilité
             │ - Testable indépendamment
             └─> Résultat passé à l'agent pour décision suivante
```

**Flux d'exécution :**

1. **User** → Donne URL Figma à l'agent
2. **Agent** → Appelle `fetchAndValidateFigma`
3. **Tool 1** → Retourne JSON Figma validé
4. **Agent** → Analyse le retour, appelle `analyzeFigmaStructure`
5. **Tool 2** → Retourne plan d'architecture
6. **Agent** → Appelle `createReactProject`
7. **Tool 3** → Retourne chemin du projet
8. **Agent** → Continue avec `extractDesignTokens`, `generateTailwindConfig`, etc.
9. **Agent** → Retourne résultat final à l'utilisateur

**Clé du succès :** Agent = Cerveau qui décide, Tools = Mains qui exécutent

---

**Dernière mise à jour** : 2025-01-22
**Statut** : En cours de refactoring
**Priorité** : Créer des tools spécialisés SANS LLM et simplifier l'agent orchestrateur
