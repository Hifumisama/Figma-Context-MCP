# Plan de Développement - Figma to React Pipeline
## Projet : Génération automatique React depuis Figma via VoltAgent

---

## 🎯 Philosophie du Projet

- **Incrémental** : Un agent à la fois, validation humaine entre chaque étape
- **Simple d'abord** : Versions minimalistes, on enrichit après validation
- **Contexte VoltAgent** : Gestion de la mémoire via le système de contexte intégré
- **Budget conscient** : Modèles Gemini économiques en développement
- **Agents généralistes** : Préférer des agents réutilisables avec plusieurs responsabilités

---

## 📋 Architecture Simplifiée

### Pipeline en 6 Étapes

```
┌─────────────────────────────────────────────────────┐
│ 1. Script Fetch + Validation (pas d'agent)         │
│    → Appel MCP direct + Zod validation             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. 🏗️ Project Architect (Agent généraliste)        │
│    → Analyse + Init projet + Design System          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. 🧪 Test Engineer (Agent généraliste)            │
│    → Stratégie + Écriture des tests                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. 💻 Component Developer (Agent itératif)         │
│    → Code + Test + Debug (boucle TDD)              │
│    Appelé N fois (1 fois par composant)            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 5. 📄 Page Assembler (Agent spécialisé)           │
│    → Composition des pages + Routing                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 6. ⚡ Build Engineer (Agent généraliste)           │
│    → Build + Analyse + Optimisations                │
└─────────────────────────────────────────────────────┘
```

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
figmAgentReactCode/
├── src/
│   ├── agents/             # Agents TypeScript (6 agents max)
│   ├── workflows/          # Workflows
│   ├── tools/              # Tools personnalisés
│   └── index.ts            # Point d'entrée VoltAgent
├── workspace/              # Output des agents
├── sampleData/             # Exemples de données d'entrées
├── agents-definitions/     # Définitions markdown des agents
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
    "@google/generative-ai": "latest",
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
- ✅ **Contexte VoltAgent** : Les données validées sont passées au prochain agent via le contexte

**Implémentation** :
```typescript
// src/tools/figma/fetch-and-validate-figma.ts
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
// src/workflows/complete-pipeline.ts
import { fetchAndValidateFigma } from "../tools/figma/fetch-and-validate-figma";

const validationResult = await fetchAndValidateFigma(figmaUrl);

if (validationResult.valid) {
  console.log("✅ Figma data is valid!");
  console.log(`📊 ${validationResult.stats.componentsCount} components found`);

  // Les données sont passées au prochain agent via le contexte VoltAgent
  // (pas besoin de sauvegarder dans un fichier JSON)
}
```

**Validation** :
- [ ] JSON récupéré via MCP sans erreur
- [ ] Validation Zod passe pour un fichier valide
- [ ] Détecte les fichiers multi-pages (erreur)
- [ ] Détecte l'absence de composants (warning)
- [ ] Détecte l'absence de design tokens (warning)

---

### 🏗️ Étape 2 : Agent Project Architect
**Objectif** : Analyser Figma + Créer la structure du projet + Setup Design System

**Responsabilités Fusionnées** :
- Analyse de la structure Figma (Atomic Design)
- Création de l'arborescence du projet
- Génération des fichiers de configuration (package.json, vite, tsconfig)
- Setup du Design System (tailwind.config.js)

**Implémentation** :
```typescript
// src/agents/project-architect.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import fs from "fs/promises";

// Tool: Créer des dossiers
const createFolderTool = createTool({
  name: "create_folder",
  description: "Créer une structure de dossiers",
  parameters: z.object({
    path: z.string().describe("Chemin du dossier à créer"),
  }),
  execute: async ({ path }) => {
    await fs.mkdir(path, { recursive: true });
    return { success: true, path };
  },
});

// Tool: Créer package.json
const createPackageJsonTool = createTool({
  name: "create_package_json",
  description: "Créer package.json avec dépendances",
  parameters: z.object({
    dependencies: z.array(z.string()),
  }),
  execute: async ({ dependencies }) => {
    const packageJson = {
      name: "figma-react-app",
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
        test: "vitest",
      },
      dependencies: {
        "react": "^18.3.0",
        "react-dom": "^18.3.0",
        ...dependencies.reduce((acc, dep) => {
          acc[dep] = "latest";
          return acc;
        }, {} as Record<string, string>),
      },
      devDependencies: {
        "@types/react": "^18.3.0",
        "@types/react-dom": "^18.3.0",
        "typescript": "^5.5.0",
        "vite": "^5.4.0",
        "@vitejs/plugin-react": "^4.3.0",
        "vitest": "^2.0.0",
        "@testing-library/react": "^16.0.0",
      },
    };

    await fs.writeFile(
      "workspace/project/package.json",
      JSON.stringify(packageJson, null, 2)
    );

    return { success: true };
  },
});

// Tool: Créer fichiers de configuration
const createConfigFilesTool = createTool({
  name: "create_config_files",
  description: "Créer vite.config.ts, tsconfig.json, etc.",
  parameters: z.object({
    configs: z.record(z.string()),
  }),
  execute: async ({ configs }) => {
    const createdFiles: string[] = [];

    for (const [filename, content] of Object.entries(configs)) {
      const path = `workspace/project/${filename}`;
      await fs.writeFile(path, content);
      createdFiles.push(path);
    }

    return { success: true, files: createdFiles };
  },
});

// Tool: Générer tailwind.config.js
const generateTailwindConfigTool = createTool({
  name: "generate_tailwind_config",
  description: "Générer tailwind.config.js depuis les design tokens Figma",
  parameters: z.object({
    colors: z.record(z.string()),
    fonts: z.record(z.string()),
    spacing: z.record(z.string()),
  }),
  execute: async ({ colors, fonts, spacing }) => {
    const config = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6)},
      fontFamily: ${JSON.stringify(fonts, null, 6)},
      spacing: ${JSON.stringify(spacing, null, 6)}
    },
  },
  plugins: [],
}`;

    await fs.writeFile("workspace/project/tailwind.config.js", config);

    return { success: true };
  },
});

export const projectArchitectAgent = new Agent({
  id: "project-architect",
  name: "Project Architect",
  instructions: `
    Tu es un architecte de projet React expert.

    Ton rôle est de :
    1. Analyser les données Figma validées (depuis le contexte)
    2. Créer un plan d'architecture (Atomic Design: atoms → molecules → organisms)
    3. Créer la structure de dossiers du projet React
    4. Générer tous les fichiers de configuration (package.json, vite, tsconfig)
    5. Extraire les design tokens et générer tailwind.config.js

    Tu dois utiliser les tools fournis pour :
    - create_folder: Créer les dossiers du projet
    - create_package_json: Générer package.json avec les bonnes dépendances
    - create_config_files: Créer vite.config.ts, tsconfig.json, .gitignore, etc.
    - generate_tailwind_config: Générer tailwind.config.js depuis les tokens Figma

    Structure attendue :
    workspace/project/
    ├── src/
    │   ├── components/
    │   │   ├── atoms/
    │   │   ├── molecules/
    │   │   └── organisms/
    │   ├── pages/
    │   ├── styles/
    │   └── utils/
    ├── public/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js (si design tokens présents)
    └── .gitignore

    Retourne un résumé JSON avec :
    {
      "componentsOrder": ["Button", "Input", "Card", "Header"],
      "atomicDesign": {
        "atoms": ["Button", "Input"],
        "molecules": ["Card"],
        "organisms": ["Header"]
      },
      "dependencies": ["tailwindcss", "react-router-dom"],
      "designTokensExtracted": true
    }
  `,
  llm: new VercelAIProvider(),
  model: google("gemini-2.0-flash-exp"), // Modèle Gemini pour le raisonnement
  tools: [
    createFolderTool,
    createPackageJsonTool,
    createConfigFilesTool,
    generateTailwindConfigTool,
  ],
  maxSteps: 15,
});
```

**Validation** :
- [ ] Structure créée dans `workspace/project/`
- [ ] `package.json` valide avec bonnes dépendances
- [ ] Fichiers de config créés (vite, tsconfig)
- [ ] `tailwind.config.js` généré si design tokens présents
- [ ] Ordre des composants logique (atoms avant molecules)

---

### 🧪 Étape 3 : Agent Test Engineer
**Objectif** : Planifier ET écrire les tests (approche TDD)

**Responsabilités Fusionnées** :
- Définir la stratégie de tests pour chaque composant
- Écrire les fichiers `.test.tsx`

**Implémentation** :
```typescript
// src/agents/test-engineer.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import fs from "fs/promises";

// Tool: Écrire un fichier de test
const writeTestFileTool = createTool({
  name: "write_test_file",
  description: "Écrire un fichier de test React (.test.tsx)",
  parameters: z.object({
    componentName: z.string(),
    testCode: z.string(),
  }),
  execute: async ({ componentName, testCode }) => {
    // Déterminer le dossier selon le type (atom/molecule/organism)
    // Pour simplifier, on met tout dans components/ pour l'instant
    const path = `workspace/project/src/components/${componentName}.test.tsx`;
    await fs.writeFile(path, testCode);
    return { success: true, path };
  },
});

export const testEngineerAgent = new Agent({
  id: "test-engineer",
  name: "Test Engineer",
  instructions: `
    Tu es un ingénieur QA expert en tests React.

    Ton rôle est de :
    1. Analyser chaque composant identifié par l'Architect (depuis le contexte)
    2. Définir une stratégie de tests (3-5 tests par composant)
    3. Écrire les fichiers .test.tsx en suivant l'approche TDD

    Pour chaque composant, tu dois écrire des tests qui couvrent :
    - Render de base (toujours)
    - Props validation
    - Interactions utilisateur (clicks, inputs)
    - Edge cases (props undefined, erreurs)

    Utilise @testing-library/react et Vitest.

    Template de test :
    \`\`\`tsx
    import { describe, it, expect } from 'vitest';
    import { render, screen } from '@testing-library/react';
    import ComponentName from './ComponentName';

    describe('ComponentName', () => {
      it('renders with default props', () => {
        render(<ComponentName />);
        expect(screen.getByText('Expected')).toBeInTheDocument();
      });

      it('handles user interaction', async () => {
        const { user } = render(<ComponentName />);
        await user.click(screen.getByRole('button'));
        expect(screen.getByText('Updated')).toBeInTheDocument();
      });
    });
    \`\`\`

    Les tests DOIVENT échouer initialement (TDD).
  `,
  llm: new VercelAIProvider(),
  model: google("gemini-2.0-flash-exp"),
  tools: [writeTestFileTool],
  maxSteps: 10,
});
```

**Validation** :
- [ ] Fichiers `.test.tsx` créés pour chaque composant
- [ ] Tests syntaxiquement corrects
- [ ] Tests échouent (composants pas encore implémentés)
- [ ] Couverture : render + props + interactions

---

### 💻 Étape 4 : Agent Component Developer
**Objectif** : Implémenter les composants en suivant TDD (Code + Test + Debug)

**Responsabilités Fusionnées** :
- Lire les tests existants
- Écrire le code du composant
- Exécuter les tests
- Corriger les erreurs (debug)
- Itérer jusqu'à ce que tous les tests passent

**Note** : Cet agent est **itératif** - appelé N fois (1 fois par composant)

**Implémentation** :
```typescript
// src/agents/component-developer.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Tool: Écrire un composant
const writeComponentTool = createTool({
  name: "write_component",
  description: "Écrire le code d'un composant React",
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

// Tool: Exécuter les tests
const runTestsTool = createTool({
  name: "run_tests",
  description: "Exécuter les tests pour un composant spécifique",
  parameters: z.object({
    componentName: z.string(),
  }),
  execute: async ({ componentName }) => {
    const testFile = `src/components/${componentName}.test.tsx`;

    try {
      const { stdout, stderr } = await execAsync(
        `npm test -- ${testFile}`,
        { cwd: "workspace/project" }
      );

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

// Tool: Lire le code d'un fichier
const readFileTool = createTool({
  name: "read_file",
  description: "Lire le contenu d'un fichier",
  parameters: z.object({
    path: z.string(),
  }),
  execute: async ({ path }) => {
    const content = await fs.readFile(path, "utf-8");
    return { content };
  },
});

export const componentDeveloperAgent = new Agent({
  id: "component-developer",
  name: "Component Developer",
  instructions: `
    Tu es un développeur React senior expert en TDD.

    Ton rôle est d'implémenter UN composant en suivant cette boucle :
    1. Lire le fichier de test (.test.tsx) avec read_file
    2. Comprendre les requirements (quels tests doivent passer)
    3. Écrire le composant React avec write_component
    4. Exécuter les tests avec run_tests
    5. SI des tests échouent :
       - Analyser les erreurs
       - Corriger le code
       - Re-tester
       - Répéter jusqu'à ce que tous les tests passent

    Principes :
    - Code minimal pour passer les tests (TDD)
    - TypeScript strict
    - Composants fonctionnels
    - Props typées avec interface
    - Utiliser Tailwind CSS pour le styling

    Template de composant :
    \`\`\`tsx
    import React from 'react';

    interface ButtonProps {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: 'primary' | 'secondary';
    }

    const Button: React.FC<ButtonProps> = ({
      children,
      onClick,
      variant = 'primary'
    }) => {
      return (
        <button
          onClick={onClick}
          className={\`btn btn-\${variant}\`}
        >
          {children}
        </button>
      );
    };

    export default Button;
    \`\`\`

    Tu dois itérer jusqu'à ce que run_tests retourne success: true.
  `,
  llm: new VercelAIProvider(),
  model: google("gemini-2.0-flash-exp"),
  tools: [writeComponentTool, runTestsTool, readFileTool],
  maxSteps: 20, // Plus de steps pour la boucle debug
  markdown: true,
});
```

**Validation** :
- [ ] Composant créé dans `src/components/`
- [ ] Tous les tests passent (success: true)
- [ ] Code TypeScript valide
- [ ] Pas de régression (anciens tests toujours OK)

---

### 📄 Étape 5 : Agent Page Assembler
**Objectif** : Créer les pages React en composant les composants

**Implémentation** :
```typescript
// src/agents/page-assembler.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import fs from "fs/promises";

// Tool: Créer une page
const createPageTool = createTool({
  name: "create_page",
  description: "Créer une page React",
  parameters: z.object({
    pageName: z.string(),
    code: z.string(),
  }),
  execute: async ({ pageName, code }) => {
    const path = `workspace/project/src/pages/${pageName}.tsx`;
    await fs.writeFile(path, code);
    return { success: true, path };
  },
});

// Tool: Setup routing (si multi-pages)
const setupRoutingTool = createTool({
  name: "setup_routing",
  description: "Configurer React Router",
  parameters: z.object({
    routes: z.array(z.object({
      path: z.string(),
      component: z.string(),
    })),
  }),
  execute: async ({ routes }) => {
    const routerCode = `
import { BrowserRouter, Routes, Route } from 'react-router-dom';
${routes.map(r => `import ${r.component} from './pages/${r.component}';`).join('\n')}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        ${routes.map(r => `<Route path="${r.path}" element={<${r.component} />} />`).join('\n        ')}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
`;

    await fs.writeFile("workspace/project/src/AppRouter.tsx", routerCode);
    return { success: true };
  },
});

export const pageAssemblerAgent = new Agent({
  id: "page-assembler",
  name: "Page Assembler",
  instructions: `
    Tu es un architecte frontend expert en composition de pages React.

    Ton rôle est de :
    1. Analyser la structure Figma (depuis le contexte)
    2. Identifier les différentes pages/screens
    3. Composer chaque page en important les composants créés
    4. Setup React Router si multi-pages détecté

    Template de page :
    \`\`\`tsx
    import React from 'react';
    import Header from '../components/Header';
    import Card from '../components/Card';
    import Button from '../components/Button';

    const HomePage: React.FC = () => {
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto p-8">
            <Card>
              <h1 className="text-4xl font-bold">Welcome</h1>
              <Button variant="primary">Get Started</Button>
            </Card>
          </main>
        </div>
      );
    };

    export default HomePage;
    \`\`\`

    Utilise create_page pour chaque page.
    Si plusieurs pages, utilise setup_routing pour configurer le router.
  `,
  llm: new VercelAIProvider(),
  model: google("gemini-2.0-flash-exp"),
  tools: [createPageTool, setupRoutingTool],
  maxSteps: 10,
  markdown: true,
});
```

**Validation** :
- [ ] Pages créées dans `src/pages/`
- [ ] Composants correctement importés
- [ ] Routing configuré (si multi-pages)
- [ ] Pages render sans crash

---

### ⚡ Étape 6 : Agent Build Engineer
**Objectif** : Build + Analyse + Optimisations

**Implémentation** :
```typescript
// src/agents/build-engineer.ts
import { Agent, createTool } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Tool: Lancer le build
const runBuildTool = createTool({
  name: "run_build",
  description: "Lancer le build de production",
  parameters: z.object({}),
  execute: async () => {
    try {
      const { stdout, stderr } = await execAsync("npm run build", {
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

// Tool: Analyser le bundle
const analyzeBundleTool = createTool({
  name: "analyze_bundle",
  description: "Analyser la taille du bundle",
  parameters: z.object({}),
  execute: async () => {
    // Lire les fichiers du dossier dist/ et calculer les tailles
    const fs = require("fs/promises");
    const path = require("path");

    const distPath = "workspace/project/dist";

    try {
      const files = await fs.readdir(distPath, { recursive: true });
      const sizes: Record<string, number> = {};

      for (const file of files) {
        const filePath = path.join(distPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          sizes[file] = stats.size;
        }
      }

      return { success: true, sizes };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});

export const buildEngineerAgent = new Agent({
  id: "build-engineer",
  name: "Build Engineer",
  instructions: `
    Tu es un ingénieur DevOps expert en optimisation frontend.

    Ton rôle est de :
    1. Lancer le build de production avec run_build
    2. Vérifier qu'il réussit sans erreurs
    3. Analyser la taille du bundle avec analyze_bundle
    4. Suggérer des optimisations si nécessaire :
       - Lazy loading pour les gros composants
       - Code splitting par route
       - Tree shaking des dépendances inutilisées
       - Compression des assets

    Critères de succès :
    - Build réussit (success: true)
    - Bundle JS total < 200KB gzipped
    - Pas d'erreurs TypeScript
    - Pas de warnings critiques

    Format de rapport :
    {
      "buildSuccess": true,
      "bundleSize": "156KB",
      "suggestions": [
        "Consider lazy loading the Dashboard component",
        "Remove unused lodash dependency"
      ]
    }
  `,
  llm: new VercelAIProvider(),
  model: google("gemini-2.0-flash-exp"),
  tools: [runBuildTool, analyzeBundleTool],
  maxSteps: 5,
});
```

**Validation** :
- [ ] Build réussit sans erreurs
- [ ] Bundle size acceptable (< 200KB)
- [ ] Suggestions d'optimisation pertinentes

---

## 🔗 Pipeline Workflow Complet

**Workflow orchestrant tous les agents** :

```typescript
// src/workflows/complete-pipeline.ts
import { createWorkflowChain } from "@voltagent/core";
import { z } from "zod";
import {
  projectArchitectAgent,
  testEngineerAgent,
  componentDeveloperAgent,
  pageAssemblerAgent,
  buildEngineerAgent,
} from "../agents";
import { fetchAndValidateFigma } from "../tools/figma/fetch-and-validate-figma";

export const completePipeline = createWorkflowChain({
  id: "figma-to-react-pipeline",
  name: "Complete Figma to React Pipeline",
  purpose: "Transform Figma designs into production React apps",
  input: z.object({
    figmaUrl: z.string().url(),
  }),
  result: z.object({
    projectPath: z.string(),
    buildSuccess: z.boolean(),
    componentsGenerated: z.number(),
  }),
})
  // Étape 1: Validation (script TypeScript, pas d'agent)
  .andAgent(
    async ({ input }) => {
      const validationResult = await fetchAndValidateFigma(input.figmaUrl);

      if (!validationResult.valid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(", ")}`);
      }

      return {
        prompt: `Données Figma validées : ${validationResult.stats.componentsCount} composants, ${validationResult.stats.hasDesignTokens ? 'avec' : 'sans'} design tokens`,
        data: validationResult.data,
      };
    }
  )

  // Étape 2: Project Architect
  .andAgent(
    ({ data }) => `Analyse ces données Figma et crée le projet React avec design system : ${JSON.stringify(data)}`,
    projectArchitectAgent,
    { schema: z.object({ componentsOrder: z.array(z.string()) }) }
  )

  // Étape 3: Test Engineer
  .andAgent(
    ({ data }) => `Écris les tests pour ces composants : ${data.componentsOrder.join(", ")}`,
    testEngineerAgent
  )

  // Étape 4: Component Developer (boucle)
  .andAgent(
    ({ data }) => {
      // Pour chaque composant, appeler l'agent
      const components = data.componentsOrder;
      return `Implémente ces composants en TDD (1 par 1) : ${components.join(", ")}`;
    },
    componentDeveloperAgent
  )

  // Étape 5: Page Assembler
  .andAgent(
    () => "Compose les pages à partir des composants créés",
    pageAssemblerAgent
  )

  // Étape 6: Build Engineer
  .andAgent(
    () => "Lance le build et analyse les optimisations possibles",
    buildEngineerAgent
  );
```

---

## 🔧 Configuration VoltAgent

### Variables d'environnement (.env)
```env
# Google Generative AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# MCP Server
MCP_ENDPOINT=http://localhost:3333

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
- ✅ **Bundle optimisé** : < 200KB gzipped

---

## 🎯 Pattern d'Orchestration Utilisé

**Pattern Simplifié avec Contexte VoltAgent** :

```
[MCP Call] → [Validation Script] → [VoltAgent Context]
                                          ↓
        [Project Architect] → Analyse + Init + Design System
                                          ↓
           [Test Engineer] → Stratégie + Écriture tests
                                          ↓
      [Component Developer] → Code + Test + Debug (itératif)
                                          ↓
          [Page Assembler] → Composition des pages
                                          ↓
         [Build Engineer] → Build + Analyse + Optimisations
```

**Communication** : Via le contexte VoltAgent (pas de fichiers JSON intermédiaires)

---

## 🚀 Commandes de Lancement

```bash
# Installation
pnpm install

# Lancer le pipeline complet
pnpm dev

# Lancer un agent spécifique (dev/debug)
tsx src/agents/project-architect.ts

# Tests
pnpm test

# Build
pnpm build
```

---

## ✅ Checklist Avant Passage à l'Étape Suivante

- [ ] Agent créé dans `src/agents/`
- [ ] Définition markdown créée dans `agents-definitions/`
- [ ] Tests manuels effectués
- [ ] Output validé
- [ ] Commit Git avec message explicite
- [ ] Documentation des problèmes

---

## 📝 Notes Importantes

### Gestion du Contexte
- ✅ **Contexte VoltAgent** : Gestion automatique de la mémoire entre agents
- ✅ Pas besoin de fichiers JSON intermédiaires
- ✅ Chaque agent doit être **autonome et testable** individuellement

### Modèles & Coûts
- **gemini-2.0-flash-exp** : Modèle principal (rapide, économique, performant)
- **gemini-1.5-pro** : Pour tâches très complexes si nécessaire (plus lent, plus cher)

### Hooks d'Observabilité
Pour chaque agent, on peut ajouter :
```typescript
hooks: {
  onStart: (context) => console.log(`🚀 ${agent.name} started`),
  onEnd: (result) => console.log(`✅ ${agent.name} completed`),
  onError: (error) => console.error(`❌ ${agent.name} failed:`, error),
}
```

### Agents Réutilisables
- **Component Developer** : Appelé N fois (1 fois par composant)
- Les autres agents sont appelés 1 fois dans le workflow
- Préférer des agents généralistes avec plusieurs responsabilités

---

## 🎓 Différences avec le Plan Original

| Ancien Plan | Nouveau Plan (Simplifié) |
|-------------|--------------------------|
| 10+ agents spécialisés | 5 agents généralistes |
| Fichiers JSON intermédiaires | Contexte VoltAgent |
| GPT-4o / GPT-4o-mini | Gemini 2.0 Flash |
| Test Planner + Test Writer | Test Engineer (fusionné) |
| Coder + Test Runner + Debugger | Component Developer (fusionné) |
| Architect + Initializer + Design System | Project Architect (fusionné) |

**Avantages** :
- Moins de complexité d'orchestration
- Moins de tokens consommés (pas d'overhead inter-agents)
- Agents plus autonomes et réutilisables
- Contexte mieux maîtrisé
