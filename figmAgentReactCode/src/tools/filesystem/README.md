# Filesystem Tools

Ensemble de tools VoltAgent pour manipuler le système de fichiers et exécuter des commandes shell.

## 📦 Tools disponibles

### 1. `read_file` - Lire un fichier

**Utilisation :** Lire le contenu de n'importe quel fichier (package.json, configuration, code source, etc.)

**Paramètres :**
- `filePath` (string) : Chemin absolu ou relatif vers le fichier

**Exemple d'utilisation dans un agent :**
```typescript
// L'agent peut appeler ce tool pour lire package.json
read_file({ filePath: "workspace/project/package.json" })
```

**Retour :**
```typescript
{
  success: true,
  content: "...", // Contenu du fichier
  filePath: "workspace/project/package.json",
  message: "Successfully read file: workspace/project/package.json"
}
```

---

### 2. `write_file` - Écrire dans un fichier

**Utilisation :** Créer ou écraser un fichier avec du contenu (création automatique du dossier parent)

**Paramètres :**
- `filePath` (string) : Chemin du fichier à créer
- `content` (string) : Contenu à écrire

**Exemple d'utilisation dans un agent :**
```typescript
// L'agent peut créer tailwind.config.js
write_file({
  filePath: "workspace/project/tailwind.config.js",
  content: `export default { ... }`
})
```

**Retour :**
```typescript
{
  success: true,
  filePath: "workspace/project/tailwind.config.js",
  bytes: 1234,
  message: "Successfully wrote 1234 bytes to workspace/project/tailwind.config.js"
}
```

---

### 3. `run_bash_command` - Exécuter une commande shell

**Utilisation :** Exécuter des commandes npm, git, etc.

**⚠️ IMPORTANT - Restrictions Windows :**
- **NE PAS** utiliser `&&` pour chaîner les commandes
- **NE PAS** inclure `cd` dans la commande
- **UTILISER** le paramètre `cwd` pour changer de dossier
- **EXÉCUTER** une seule commande à la fois

**Paramètres :**
- `command` (string) : Commande shell à exécuter (sans `cd` ni `&&`)
- `cwd` (string, optionnel) : Dossier de travail

**Exemple d'utilisation dans un agent :**
```typescript
// ✅ CORRECT - Utilise cwd au lieu de cd
run_bash_command({
  command: "npm create vite@latest project -- --template react-ts",
  cwd: "workspace"  // Le dossier de travail
})

// ✅ CORRECT - Une commande, un cwd
run_bash_command({
  command: "npm install tailwindcss postcss autoprefixer",
  cwd: "workspace/project"
})

// ❌ INCORRECT - N'utilise PAS &&
// run_bash_command({
//   command: "cd workspace && npm install"
// })
```

**Retour :**
```typescript
{
  success: true,
  stdout: "...", // Sortie de la commande
  stderr: "...", // Erreurs (peut être vide)
  command: "npm install tailwindcss",
  cwd: "workspace/project",
  message: "Command executed successfully: npm install tailwindcss"
}
```

**Note Windows :** Sur Windows, les commandes sont exécutées via PowerShell.

---

### 4. `search_files` - Rechercher des fichiers

**Utilisation :** Trouver des fichiers par pattern glob

**Paramètres :**
- `pattern` (string) : Pattern glob (ex: `**/*.tsx`, `src/**/*.ts`)
- `cwd` (string, optionnel) : Dossier de recherche

**Exemple d'utilisation dans un agent :**
```typescript
// L'agent peut trouver tous les fichiers TypeScript
search_files({
  pattern: "**/*.ts",
  cwd: "workspace/project/src"
})

// Trouver package.json
search_files({
  pattern: "package.json",
  cwd: "workspace/project"
})
```

**Retour :**
```typescript
{
  success: true,
  files: ["src/index.ts", "src/App.tsx", ...],
  count: 15,
  pattern: "**/*.ts",
  message: "Found 15 file(s) matching pattern: **/*.ts"
}
```

**Dossiers ignorés :** `node_modules/`, `dist/`, `build/`, `.git/`

---

### 5. `create_directory` - Créer un dossier

**Utilisation :** Créer un dossier et tous ses parents si nécessaire

**Paramètres :**
- `dirPath` (string) : Chemin du dossier à créer

**Exemple d'utilisation dans un agent :**
```typescript
// L'agent peut créer l'arborescence Atomic Design
create_directory({
  dirPath: "workspace/project/src/components/atoms"
})

create_directory({
  dirPath: "workspace/project/src/components/molecules"
})
```

**Retour :**
```typescript
{
  success: true,
  dirPath: "workspace/project/src/components/atoms",
  message: "Successfully created directory: workspace/project/src/components/atoms"
}
```

---

## 🔧 Utilisation dans un agent VoltAgent

### Exemple : Project Architect Agent

```typescript
import { Agent } from "@voltagent/core";
import { google } from "@ai-sdk/google";
import {
  readFileTool,
  writeFileTool,
  runBashCommandTool,
  searchFilesTool,
  createDirectoryTool,
} from "./tools/filesystem";

export const projectArchitectAgent = new Agent({
  id: "project-architect",
  name: "Project Architect",
  instructions: `
    Tu es un architecte de projet React.

    Workflow :
    1. Utilise fetch_and_validate_figma pour récupérer les données Figma
    2. Utilise create_directory pour créer l'arborescence du projet
    3. Utilise run_bash_command pour initialiser Vite
    4. Utilise write_file pour créer les fichiers de config
    5. Utilise read_file pour vérifier les fichiers créés
  `,
  model: google("gemini-2.0-flash-exp"),
  maxSteps: 10,
  tools: [
    readFileTool,
    writeFileTool,
    runBashCommandTool,
    searchFilesTool,
    createDirectoryTool,
  ],
});
```

---

## 📝 Gestion des erreurs

Tous les tools suivent le même pattern de gestion d'erreur :

```typescript
try {
  // Opération
  return { success: true, ... }
} catch (error) {
  throw new Error(`Failed to ... : ${error.message}`)
}
```

L'agent VoltAgent recevra automatiquement l'erreur et pourra adapter sa stratégie.

---

## 🧪 Tests

Pour tester manuellement un tool :

```typescript
import { readFileTool } from "./tools/filesystem";

const result = await readFileTool.execute({
  filePath: "package.json"
});

console.log(result);
// { success: true, content: "...", ... }
```

---

## 📚 Documentation VoltAgent

Pour plus d'informations sur la création de tools :
- [VoltAgent Tools Documentation](https://voltagent.dev/docs/agents/tools)
- [createTool API Reference](https://voltagent.dev/docs/tools/overview)
