# 📥 Guide d'installation

Guide complet d'installation et de configuration du serveur Figma MCP Backend.

---

## Table des matières

- [Prérequis](#prérequis)
- [Installation des dépendances](#installation-des-dépendances)
- [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
- [Configuration ADC](#configuration-adc-application-default-credentials)
- [Configuration MCP](#configuration-mcp)
- [Vérification de l'installation](#vérification-de-linstallation)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir :

- 🟢 **Node.js** >= 18.0.0
- 📦 **pnpm** (ou npm)
- ☁️ **Compte Google Cloud** (pour les règles IA optionnelles)
- 🔑 **Clé API Figma** ([Obtenir une clé](https://www.figma.com/developers/api#access-tokens))

> [!NOTE]
> Le projet fonctionne sur Windows, macOS et Linux.

---

## 📦 Installation des dépendances

### 1. Cloner et naviguer

```bash
cd back
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Build du projet

```bash
pnpm build
```

> [!TIP]
> Utilisez `pnpm dev` pour le développement avec rebuild automatique.

---

## ⚙️ Configuration des variables d'environnement

### Créer le fichier `.env`

Créez un fichier `.env` à la racine du dossier `back/` :

```bash
# ============================================
# OBLIGATOIRE - Accès Figma
# ============================================
# Personal Access Token (recommandé pour développement)
FIGMA_API_KEY=your_figma_personal_access_token

# OU OAuth Bearer Token (pour production)
# FIGMA_OAUTH_TOKEN=your_figma_oauth_token


# ============================================
# OBLIGATOIRE - Google Cloud (pour LLM)
# ============================================
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_CLOUD_LOCATION=us-central1         # Région Vertex AI (défaut: us-central1)

# Authentification : Application Default Credentials (ADC)
# Le projet utilise uniquement ADC pour l'authentification Google Cloud.
# Configurez ADC en vous connectant avec gcloud :
#   gcloud auth application-default login
#
# En production (Cloud Run), ADC utilise automatiquement le compte de service
# de l'environnement d'exécution (metadata service)


# ============================================
# OPTIONNEL - Configuration serveur
# ============================================
PORT=3333                                  # Port HTTP (défaut: 3333, prod: 8080)
OUTPUT_FORMAT=json                         # Format de sortie: "json" ou "yaml" (défaut: json)
SKIP_IMAGE_DOWNLOADS=false                 # Désactiver le téléchargement d'images (défaut: false)


# ============================================
# OPTIONNEL - Configuration LLM
# ============================================
ENABLE_AI_RULES=false                      # Activer règles IA (défaut: false)
LLM_MODEL=gemini-2.0-flash-exp             # Modèle LLM (défaut: gemini-2.0-flash-exp)
LLM_MAX_TOKENS=8192                        # Tokens max (défaut: 8192)
LLM_TEMPERATURE=0.9                        # Température (défaut: 0.9)


# ============================================
# OPTIONNEL - Configuration CORS
# ============================================
FRONTEND_URL=http://localhost:5173         # URL frontend pour CORS
```

### Variables obligatoires vs optionnelles

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `FIGMA_API_KEY` ou `FIGMA_OAUTH_TOKEN` | ✅ Oui | Accès à l'API Figma |
| `GOOGLE_CLOUD_PROJECT` | ✅ Oui (si LLM) | Project ID Google Cloud |
| `GOOGLE_CLOUD_LOCATION` | ❌ Non | Région Vertex AI (défaut: us-central1) |
| `PORT` | ❌ Non | Port du serveur (défaut: 3333) |
| `ENABLE_AI_RULES` | ❌ Non | Activer les règles IA (défaut: false) |

> [!IMPORTANT]
> Les règles IA nécessitent un projet Google Cloud configuré avec Vertex AI activé.

---

## 🔐 Configuration ADC (Application Default Credentials)

Le projet utilise **Application Default Credentials (ADC)** pour l'authentification Google Cloud.

### En développement local

Connectez-vous avec gcloud :

```bash
gcloud auth application-default login
```

Cette commande :
1. Ouvre votre navigateur
2. Vous demande de vous authentifier avec votre compte Google
3. Stocke les credentials localement

### En production (Cloud Run)

ADC utilise **automatiquement** le compte de service de l'environnement Cloud Run. Aucune configuration supplémentaire n'est nécessaire.

### Vérifier la configuration ADC

```bash
gcloud auth application-default print-access-token
```

Si la commande retourne un token, ADC est correctement configuré.

> [!TIP]
> Si vous rencontrez des erreurs d'authentification, essayez de réinitialiser ADC avec `gcloud auth application-default revoke` puis reconnectez-vous.

---

## 🔌 Configuration MCP

### Option 1 : Claude Code (Recommandé - HTTP)

Pour ajouter ce serveur MCP à Claude Code via HTTP (plus stable que stdio) :

```bash
claude mcp add --transport http figma-mcp http://localhost:3333/mcp
```

> [!NOTE]
> Le serveur doit être lancé (`pnpm start`) pour que cette commande fonctionne.

**Avantages du mode HTTP** :
- ✅ Plus stable et fiable
- ✅ Meilleure gestion des erreurs
- ✅ Pas de problèmes de buffer
- ✅ Rechargement à chaud sans redémarrer Claude

### Option 2 : Claude Desktop (JSON)

Ajoutez dans votre fichier de configuration Claude Desktop :
- macOS : `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows : `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "figma-mcp": {
      "command": "node",
      "args": ["/path/to/back/dist/cli.js", "--mode", "stdio"],
      "env": {
        "FIGMA_API_KEY": "your_api_key",
        "GOOGLE_CLOUD_PROJECT": "your_project_id",
        "GOOGLE_CLOUD_LOCATION": "us-central1"
      }
    }
  }
}
```

> [!WARNING]
> ADC sera automatiquement utilisé pour l'authentification Google Cloud. Assurez-vous d'avoir configuré ADC avec `gcloud auth application-default login`.

### Option 3 : VS Code (avec extension MCP)

Ajoutez dans votre `settings.json` :

```json
{
  "mcp.servers": {
    "figma-mcp": {
      "command": "node",
      "args": ["/path/to/back/dist/cli.js", "--mode", "stdio"],
      "env": {
        "FIGMA_API_KEY": "your_api_key",
        "GOOGLE_CLOUD_PROJECT": "your_project_id",
        "GOOGLE_CLOUD_LOCATION": "us-central1"
      }
    }
  }
}
```

---

## ✔️ Vérification de l'installation

### 1. Vérifier le build

```bash
pnpm build
```

Doit se terminer sans erreurs.

### 2. Lancer les tests

```bash
pnpm test
```

Tous les tests doivent passer.

### 3. Démarrer le serveur

```bash
pnpm start
```

Vous devriez voir :
```
Server running on http://localhost:3333
MCP server ready
```

### 4. Tester l'API REST

```bash
curl http://localhost:3333/health
```

Doit retourner : `{"status":"ok"}`

### 5. Tester un audit (optionnel)

```bash
curl -X POST http://localhost:3333/api/audit-figma \
  -H "Content-Type: application/json" \
  -d '{"figmaUrl": "https://www.figma.com/file/your_public_file"}'
```

> [!TIP]
> Utilisez un fichier Figma public pour tester sans clé API.

---

## 🐛 Résolution de problèmes

### Erreur : "Cannot find module"

```bash
# Nettoyer et réinstaller
rm -rf node_modules dist
pnpm install
pnpm build
```

### Erreur : "FIGMA_API_KEY is required"

Vérifiez que votre fichier `.env` contient bien `FIGMA_API_KEY` et qu'il est à la racine du dossier `back/`.

### Erreur : "Google Cloud authentication failed"

```bash
# Réinitialiser ADC
gcloud auth application-default revoke
gcloud auth application-default login
```

### Le serveur ne démarre pas

Vérifiez que le port 3333 n'est pas déjà utilisé :

```bash
# Windows
netstat -ano | findstr :3333

# macOS/Linux
lsof -i :3333
```

---

## 📚 Prochaines étapes

- 🚀 [Guide de déploiement](DEPLOYMENT.md)
- 🔍 [Documentation des règles d'audit](AUDIT_RULES.md)
- 🧩 [Système d'extractors](../src/extractors/README.md)
- 📖 [Retour au README principal](../README.md)
