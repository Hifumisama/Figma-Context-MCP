# Plan de Développement - Figma to React Pipeline
## Projet : Génération automatique React depuis Figma via VoltAgent

---

## 🎯 Philosophie du Projet

- **Incrémental** : Un agent à la fois, validation humaine entre chaque étape
- **Simple d'abord** : Versions minimalistes, on enrichit après validation
- **Contexte maîtrisé** : Purge de la fenêtre de contexte entre agents
- **Budget conscient** : Modèles économiques en développement

---

## 📋 Étapes de Développement

### ✅ Étape 0 : Fondations (Fait par l'humain)
**Objectif** : Infrastructure de base

**Actions** :
- Installation de VoltAgent (local au projet)
- Initialisation Git + premier commit
- Configuration des variables d'environnement

**Livrables** :
```
figma-to-react/
├── src/
│   ├── agents/          # Agents TypeScript
│   ├── workflows/       # Workflows
│   └── index.ts         # Point d'entrée VoltAgent
├── workspace/           # Output des agents
├── sampleData/          # exemples de données d'entrées des outils  
├── examples/
│   └── sample-button.json
├── package.json
├── tsconfig.json
└── .env
```

**Dépendances de base** :
```json
{
  "dependencies": {
    "@voltagent/core": "latest",
    "@voltagent/vercel-ai": "latest",
    "@ai-sdk/openai": "latest",
    "ai": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "tsx": "latest"
  }
}
```

---

### 🔄 Étape 1 : Script de Validation Figma (Fetch + Validation)
**Objectif** : Récupérer et valider le JSON Figma **sans utiliser d'agent** (économie de tokens)

**Philosophie** :
- ❌ **Pas d'agent** pour une simple récupération de données (gaspillage de tokens)
- ✅ **Appel MCP direct** + validation TypeScript pure
- ✅ Fusion des anciennes étapes 1 (Extractor) et 2 (Validator) en un seul script

**Implémentation** :
```typescript
// src/utils/fetch-and-validate-figma.ts
import { MCPConfiguration } from "@voltagent/core";
import { z } from "zod";

// Schéma de validation basé sur sampleDataFromFigmaContext.json
const FigmaDataSchema = z.object({
  name: z.string(),
  lastModified: z.string(),
  thumbnailUrl: z.string().url(),
  nodes: z.array(z.any()).min(1, "Must have at least one root node"),
  components: z.record(z.any()).optional(),
  componentSets: z.record(z.any()).optional(),
  globalVars: z.object({
    designSystem: z.object({
      text: z.record(z.any()).optional(),
      colors: z.record(z.any()).optional(),
      strokes: z.record(z.any()).optional(),
      layout: z.record(z.any()).optional(),
    }),
    localStyles: z.any().optional(),
    images: z.record(z.any()).optional(),
  }),
});

interface ValidationResult {
  valid: boolean;
  data?: z.infer<typeof FigmaDataSchema>;
  errors: string[];
  warnings: string[];
  stats: {
    componentsCount: number;
    hasDesignTokens: boolean;
    nodesCount: number;
  };
}

export async function fetchAndValidateFigma(
  figmaUrl: string
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: false,
    errors: [],
    warnings: [],
    stats: {
      componentsCount: 0,
      hasDesignTokens: false,
      nodesCount: 0,
    },
  };

  try {
    // 1. Configuration MCP
    const mcpConfig = new MCPConfiguration({
      servers: {
        figma: {
          type: "http",
          url: process.env.MCP_ENDPOINT || "http://localhost:3333",
          timeout: 30000,
        },
      },
    });

    // 2. Récupération des tools MCP
    const toolsets = await mcpConfig.getToolsets();
    const figmaTools = toolsets.figma.getTools();

    // 3. Recherche du tool get_figma_context
    const getFigmaContextTool = figmaTools.find(
      (tool) => tool.name === "get_figma_context"
    );

    if (!getFigmaContextTool) {
      result.errors.push("MCP tool 'get_figma_context' not found");
      return result;
    }

    // 4. Appel direct du tool MCP (pas d'agent !)
    console.log("🔌 Calling MCP tool: get_figma_context...");
    const response = await getFigmaContextTool.execute({ url: figmaUrl });

    // 5. Parse la réponse (doit être du JSON)
    let figmaData: any;
    try {
      figmaData = typeof response === "string" ? JSON.parse(response) : response;
    } catch (e) {
      result.errors.push("MCP response is not valid JSON");
      return result;
    }

    // 6. Validation Zod
    const validation = FigmaDataSchema.safeParse(figmaData);

    if (!validation.success) {
      result.errors.push(...validation.error.errors.map((e) => e.message));
      return result;
    }

    result.data = validation.data;

    // 7. Vérifications spécifiques

    // Check: Au moins 1 composant
    const componentsCount = Object.keys(validation.data.components || {}).length;
    result.stats.componentsCount = componentsCount;

    if (componentsCount === 0) {
      result.warnings.push("No components found in Figma file");
    }

    // Check: Design tokens existent
    const hasColors = Object.keys(validation.data.globalVars.designSystem.colors || {}).length > 0;
    const hasText = Object.keys(validation.data.globalVars.designSystem.text || {}).length > 0;
    result.stats.hasDesignTokens = hasColors || hasText;

    if (!result.stats.hasDesignTokens) {
      result.warnings.push("No design tokens (colors/text styles) found");
    }

    // Check: Un seul nœud racine (pas de multi-pages)
    result.stats.nodesCount = validation.data.nodes.length;

    if (validation.data.nodes.length > 1) {
      result.errors.push(
        `Multiple root nodes found (${validation.data.nodes.length}). ` +
        `Please select a single page or frame in Figma.`
      );
      return result;
    }

    if (validation.data.nodes.length === 0) {
      result.errors.push("No nodes found in Figma data");
      return result;
    }

    // 8. Si tout est OK
    result.valid = result.errors.length === 0;

    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : "Unknown error"
    );
    return result;
  }
}
```

**Utilisation** :
```typescript
// src/test-validation.ts
import { fetchAndValidateFigma } from "./utils/fetch-and-validate-figma";

const TEST_URL = "https://www.figma.com/design/YOUR_FILE_ID/...?node-id=0-3";

const result = await fetchAndValidateFigma(TEST_URL);

if (result.valid) {
  console.log("✅ Figma data is valid!");
  console.log(`📊 ${result.stats.componentsCount} components found`);
  console.log(`🎨 Design tokens: ${result.stats.hasDesignTokens ? "Yes" : "No"}`);
} else {
  console.error("❌ Validation failed:");
  result.errors.forEach((err) => console.error(`  - ${err}`));
}

if (result.warnings.length > 0) {
  console.warn("⚠️  Warnings:");
  result.warnings.forEach((warn) => console.warn(`  - ${warn}`));
}
```

**Validation** :
- [ ] JSON récupéré via MCP sans erreur
- [ ] Validation Zod passe pour un fichier valide
- [ ] Détecte les fichiers multi-pages (erreur)
- [ ] Détecte l'absence de composants (warning)
- [ ] Détecte l'absence de design tokens (warning)
- [ ] Contenu structuré et exploitable pour les agents suivants

---

### 🏗️ Étape 3 : Agent Architect
**Objectif** : Créer le plan de génération

**Implémentation** :
```typescript
// src/agents/architect.ts
import { Agent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";

export const architectAgent = new Agent({
  id: "architect",
  name: "Project Architect",
  instructions: `
    You are a React project architect.
    Analyze the validated Figma JSON and create:
    1. Component generation order (atoms → molecules → organisms)
    2. Project folder structure
    3. List of required dependencies
    Return a structured plan in JSON format.
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o"), // Need reasoning for architecture
  maxSteps: 5,
});
```

**Output attendu** :
```json
{
  "componentsOrder": ["Button", "Input", "Card", "Header"],
  "projectStructure": {
    "src/components/atoms": ["Button", "Input"],
    "src/components/molecules": ["Card"],
    "src/components/organisms": ["Header"]
  },
  "dependencies": ["react-router-dom", "tailwindcss"]
}
```

**Validation** :
- [ ] Ordre logique (atoms avant molecules)
- [ ] Pas de dépendances circulaires

---

### 🛠️ Étape 4 : Agent Project Initializer
**Objectif** : Créer la structure du projet React

**Implémentation** :
```typescript
// src/agents/initializer.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

// Tool pour créer des dossiers
const createFolderTool = createTool({
  name: "create_folder",
  description: "Create a folder structure",
  parameters: z.object({
    path: z.string().describe("Folder path to create"),
  }),
  execute: async ({ path }) => {
    await fs.mkdir(path, { recursive: true });
    return { success: true, path };
  },
});

// Tool pour créer package.json
const createPackageJsonTool = createTool({
  name: "create_package_json",
  description: "Create package.json with dependencies",
  parameters: z.object({
    dependencies: z.array(z.string()),
  }),
  execute: async ({ dependencies }) => {
    const packageJson = {
      name: "figma-react-app",
      version: "1.0.0",
      scripts: {
        dev: "vite",
        build: "vite build",
        test: "vitest",
      },
      dependencies: dependencies.reduce((acc, dep) => {
        acc[dep] = "latest";
        return acc;
      }, {} as Record<string, string>),
    };
    
    await fs.writeFile(
      "workspace/project/package.json",
      JSON.stringify(packageJson, null, 2)
    );
    
    return { success: true };
  },
});

export const initializerAgent = new Agent({
  id: "initializer",
  name: "Project Initializer",
  instructions: `
    You initialize React projects.
    1. Create the folder structure from the architecture plan
    2. Generate package.json with required dependencies
    3. Setup basic Vite config
    Use the provided tools to create files and folders.
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o-mini"),
  tools: [createFolderTool, createPackageJsonTool],
  maxSteps: 10,
});
```

**Validation** :
- [ ] Structure créée dans `workspace/project/`
- [ ] `package.json` valide

---

### 🎨 Étape 5 : Agent Design System Generator
**Objectif** : Générer les tokens CSS depuis Figma

**Implémentation** :
```typescript
// src/agents/design-system.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import fs from "fs/promises";

const generateTailwindConfigTool = createTool({
  name: "generate_tailwind_config",
  description: "Generate tailwind.config.js from design tokens",
  parameters: z.object({
    colors: z.record(z.string()),
    fonts: z.record(z.string()),
    spacing: z.record(z.string()),
  }),
  execute: async ({ colors, fonts, spacing }) => {
    const config = `
module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 2)},
      fontFamily: ${JSON.stringify(fonts, null, 2)},
      spacing: ${JSON.stringify(spacing, null, 2)}
    }
  }
}`;
    
    await fs.writeFile(
      "workspace/project/tailwind.config.js",
      config
    );
    
    return { success: true };
  },
});

export const designSystemAgent = new Agent({
  id: "design-system",
  name: "Design System Generator",
  instructions: `
    Extract design tokens from Figma JSON:
    - Colors from 'designTokens.colors'
    - Fonts from 'designTokens.typography'
    - Spacing from 'designTokens.spacing'
    Generate tailwind.config.js using the tool.
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o-mini"),
  tools: [generateTailwindConfigTool],
  maxSteps: 3,
});
```

**Validation** :
- [ ] `tailwind.config.js` créé
- [ ] Au moins 3 couleurs extraites

---

### 📝 Étape 6 : Agent Test Planner
**Objectif** : Définir les tests à écrire (approche TDD)

**Implémentation** :
```typescript
// src/agents/test-planner.ts
import { Agent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const testSpecSchema = z.object({
  componentName: z.string(),
  tests: z.array(z.object({
    description: z.string(),
    type: z.enum(["render", "props", "interaction", "snapshot"]),
  })),
});

export const testPlannerAgent = new Agent({
  id: "test-planner",
  name: "Test Strategy Planner",
  instructions: `
    For each component, define 3-5 essential tests:
    - Render test (always)
    - Props validation
    - User interactions (if applicable)
    Return test specifications in structured format.
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o"), // Need good reasoning for test strategy
  maxSteps: 3,
});
```

**Output attendu** :
```json
{
  "Button": [
    { "description": "renders with text prop", "type": "render" },
    { "description": "calls onClick when clicked", "type": "interaction" },
    { "description": "applies variant styles correctly", "type": "props" }
  ]
}
```

**Validation** :
- [ ] Tests pertinents pour chaque composant
- [ ] Pas de tests redondants

---

### ✍️ Étape 7 : Agent Test Writer
**Objectif** : Écrire les fichiers de tests (TDD)

**Implémentation** :
```typescript
// src/agents/test-writer.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import fs from "fs/promises";

const writeTestFileTool = createTool({
  name: "write_test_file",
  description: "Write a test file",
  parameters: z.object({
    componentName: z.string(),
    testCode: z.string(),
  }),
  execute: async ({ componentName, testCode }) => {
    const path = `workspace/project/src/components/${componentName}.test.tsx`;
    await fs.writeFile(path, testCode);
    return { success: true, path };
  },
});

export const testWriterAgent = new Agent({
  id: "test-writer",
  name: "Test Code Writer",
  instructions: `
    Write React tests using @testing-library/react.
    Follow this template structure:
    - Import necessary utilities
    - Write test cases based on specifications
    - Use descriptive test names
    - Keep tests simple and focused
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o"), // Need code generation quality
  tools: [writeTestFileTool],
  maxSteps: 5,
});
```

**Validation** :
- [ ] Fichiers `.test.tsx` syntaxiquement corrects
- [ ] Tests échouent (composant pas encore créé)

---

### 💻 Étape 8 : Agent Component Coder
**Objectif** : Implémenter le composant pour passer les tests

**Implémentation** :
```typescript
// src/agents/coder.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import fs from "fs/promises";

const writeComponentTool = createTool({
  name: "write_component",
  description: "Write React component code",
  parameters: z.object({
    componentName: z.string(),
    code: z.string(),
  }),
  execute: async ({ componentName, code }) => {
    const path = `workspace/project/src/components/${componentName}.tsx`;
    await fs.writeFile(path, code);
    return { success: true, path };
  },
});

export const coderAgent = new Agent({
  id: "coder",
  name: "Component Coder",
  instructions: `
    Implement React components to pass the provided tests.
    - Read the test file to understand requirements
    - Write minimal code to pass tests (TDD approach)
    - Use TypeScript and functional components
    - Follow React best practices
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o"), // Need good code generation
  tools: [writeComponentTool],
  maxSteps: 7,
  markdown: true, // Enable code formatting
});
```

**Validation** :
- [ ] Tests passent après génération du composant

---

### 🔄 Étape 9 : Agent Test Runner
**Objectif** : Exécuter les tests automatiquement

**Implémentation** :
```typescript
// src/agents/test-runner.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const runTestsTool = createTool({
  name: "run_tests",
  description: "Execute npm test and return results",
  parameters: z.object({
    testFile: z.string().optional(),
  }),
  execute: async ({ testFile }) => {
    const command = testFile 
      ? `npm test -- ${testFile}`
      : `npm test`;
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: "workspace/project",
      });
      
      return { 
        success: true,
        output: stdout,
        errors: stderr,
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || "",
        errors: error.stderr || error.message,
      };
    }
  },
});

export const testRunnerAgent = new Agent({
  id: "test-runner",
  name: "Test Executor",
  instructions: `
    Run tests and parse results.
    Report:
    - Number of tests passed
    - Number of tests failed
    - Specific failures with details
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o-mini"), // Simple parsing task
  tools: [runTestsTool],
  maxSteps: 2,
});
```

**Validation** :
- [ ] Détecte les tests échoués
- [ ] Rapport lisible et structuré

---

### 🐛 Étape 10 : Agent Debugger
**Objectif** : Corriger automatiquement les tests échoués

**Implémentation** :
```typescript
// src/agents/debugger.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import fs from "fs/promises";

const fixComponentTool = createTool({
  name: "fix_component",
  description: "Update component code to fix failing tests",
  parameters: z.object({
    componentPath: z.string(),
    fixedCode: z.string(),
  }),
  execute: async ({ componentPath, fixedCode }) => {
    await fs.writeFile(componentPath, fixedCode);
    return { success: true };
  },
});

export const debuggerAgent = new Agent({
  id: "debugger",
  name: "Code Debugger",
  instructions: `
    Analyze test failures and fix the code.
    1. Read the component code
    2. Understand the test error
    3. Make minimal changes to fix the issue
    4. Preserve existing functionality
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o"), // Need strong debugging capabilities
  tools: [fixComponentTool],
  maxSteps: 10,
  markdown: true,
});
```

**Validation** :
- [ ] Tests précédemment échoués passent
- [ ] Pas de régression

---

### 📄 Étape 11 : Agent Page Assembler
**Objectif** : Créer les pages React

**Implémentation** :
```typescript
// src/agents/assembler.ts
import { Agent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";

export const assemblerAgent = new Agent({
  id: "assembler",
  name: "Page Assembler",
  instructions: `
    Create React pages by composing components.
    - Import the required components
    - Follow the layout from Figma JSON
    - Add React Router setup if needed
    - Keep pages simple and maintainable
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o"),
  maxSteps: 10,
  markdown: true,
});
```

**Validation** :
- [ ] Pages render sans crash
- [ ] Composants bien importés

---

### ⚡ Étape 12 : Agent Optimizer
**Objectif** : Optimiser le build final

**Implémentation** :
```typescript
// src/agents/optimizer.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const analyzeBundleTool = createTool({
  name: "analyze_bundle",
  description: "Run build and analyze bundle size",
  parameters: z.object({}),
  execute: async () => {
    const { stdout } = await execAsync("npm run build", {
      cwd: "workspace/project",
    });
    
    // Parse build output for bundle size
    return { 
      output: stdout,
      // Extract size info from build logs
    };
  },
});

export const optimizerAgent = new Agent({
  id: "optimizer",
  name: "Bundle Optimizer",
  instructions: `
    Optimize the React application:
    1. Run production build
    2. Analyze bundle size
    3. Suggest lazy loading for large components
    4. Identify unused dependencies
  `,
  llm: new VercelAIProvider(),
  model: openai("gpt-4o-mini"),
  tools: [analyzeBundleTool],
  maxSteps: 5,
});
```

**Validation** :
- [ ] Build réussit
- [ ] Suggestions d'optimisation pertinentes

---

## 🔗 Pipeline Workflow Complet

**Workflow orchestrant tous les agents** :

```typescript
// src/workflows/complete-pipeline.ts
import { createWorkflowChain } from "@voltagent/core";
import { z } from "zod";
import { 
  extractorAgent, 
  validatorAgent, 
  architectAgent,
  // ... autres agents
} from "../agents";

export const completePipeline = createWorkflowChain({
  id: "figma-to-react-pipeline",
  name: "Complete Figma to React Pipeline",
  purpose: "Transform Figma designs into production React apps",
  input: z.object({}),
  result: z.object({
    projectPath: z.string(),
    testsCoverage: z.number(),
    buildStatus: z.string(),
  }),
})
  // Étape 1: Extraction
  .andAgent(
    () => "Fetch JSON from MCP",
    extractorAgent,
    { schema: z.object({ json: z.string() }) }
  )
  // Étape 2: Validation
  .andAgent(
    ({ data }) => `Validate: ${data.json}`,
    validatorAgent,
    { schema: z.object({ valid: z.boolean() }) }
  )
  // Étape 3: Architecture
  .andAgent(
    ({ data }) => `Create architecture plan from: ${data.json}`,
    architectAgent,
    { schema: z.object({ plan: z.string() }) }
  )
  // Étape 4: Initialization
  .andAgent(
    ({ data }) => `Initialize project with plan: ${data.plan}`,
    initializerAgent
  )
  // Étape 5: Design System
  .andAgent(
    ({ data }) => `Generate design system from tokens`,
    designSystemAgent
  )
  // Boucle TDD pour chaque composant
  // ... (test-planner → test-writer → coder → test-runner → debugger)
  
  // Étape finale: Assembly
  .andAgent(
    () => "Assemble all components into pages",
    assemblerAgent
  );
```

---

## 🔧 Configuration VoltAgent

### Variables d'environnement (.env)
```env
# OpenAI API (via GCP)
OPENAI_API_KEY=your_gcp_openai_key

# MCP Server
MCP_ENDPOINT=http://localhost:3333/mcp

# VoltAgent
NODE_ENV=development
```

### Point d'entrée principal (src/index.ts)
```typescript
import { VoltAgent } from "@voltagent/core";
import { createPinoLogger } from "@voltagent/logger";
import * as agents from "./agents";
import * as workflows from "./workflows";

const logger = createPinoLogger({
  name: "figma-to-react",
  level: "debug", // Verbose en dev
});

new VoltAgent({
  agents,
  workflows,
  logger,
});
```

---

## 📊 Métriques de Succès

- ✅ **Temps total** : < 1h pour 5 composants
- ✅ **Couverture de tests** : > 80%
- ✅ **Tests passants** : 100%
- ✅ **Build fonctionnel** : `npm run dev` démarre

---

## 🎯 Pattern d'Orchestration Utilisé

**Pattern Pipeline** : Chaque agent traite les données et les passe au suivant

```
[MCP JSON] → [Extractor] → [Validator] → [Architect] → [Initializer]
                                                              ↓
[Optimizer] ← [Assembler] ← [Test Loop] ← [Design System] ←─┘
```

---

## 🚀 Commandes de Lancement

```bash
# Installation
npm install

# Lancer le pipeline complet
tsx src/index.ts

# Lancer un agent spécifique (dev/debug)
tsx src/agents/extractor.ts

# Tests
npm test
```

---

## ✅ Checklist Avant Passage à l'Étape Suivante

- [ ] Agent créé dans `src/agents/`
- [ ] Tests manuels effectués
- [ ] Output validé
- [ ] Commit Git avec message explicite
- [ ] Documentation des problèmes
- [ ] **Purge du contexte** effectuée

---

## 📝 Notes Importantes

### Gestion du Contexte
- ⚠️ **CRITIQUE** : Purger le contexte entre agents pour éviter la saturation
- Utiliser des fichiers JSON dans `workspace/` pour la communication inter-agents
- Chaque agent doit être **autonome et testable** individuellement

### Modèles & Coûts
- **gpt-4o-mini** : Tâches simples (extraction, parsing, tests)
- **gpt-4o** : Tâches complexes (architecture, génération de code, debugging)

### Hooks d'Observabilité
Pour chaque agent, on peut ajouter :
```typescript
hooks: {
  onStart: (context) => console.log(`🚀 ${agent.name} started`),
  onEnd: (result) => console.log(`✅ ${agent.name} completed`),
  onError: (error) => console.error(`❌ ${agent.name} failed:`, error),
}
```