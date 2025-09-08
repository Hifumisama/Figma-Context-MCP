# API d'Audit Figma

Cette API permet d'auditer automatiquement un design Figma en enchaînant les outils `get-figma-context` et `audit-figma-design`.

## Endpoint

```
POST /api/audit-figma
```

## Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `figmaUrl` | string | ✅ | L'URL du fichier, page ou composant Figma à auditer |
| `figmaApiKey` | string | ❌ | Clé API Figma spécifique pour des fichiers avec autorisations particulières (une clé par défaut est configurée) |
| `outputFormat` | string | ❌ | Format de sortie : `"json"` (défaut) ou `"markdown"` |

## Exemple d'utilisation

### Avec curl

#### Fichier standard (clé API par défaut)
```bash
curl -X POST http://localhost:3000/api/audit-figma \
  -H "Content-Type: application/json" \
  -d '{
    "figmaUrl": "https://www.figma.com/file/abc123/Mon-Design?node-id=1%3A2",
    "outputFormat": "json"
  }'
```

#### Fichier avec autorisations spécifiques (clé API personnalisée)
```bash
curl -X POST http://localhost:3000/api/audit-figma \
  -H "Content-Type: application/json" \
  -d '{
    "figmaUrl": "https://www.figma.com/file/abc123/Mon-Design-Specifique?node-id=1%3A2",
    "figmaApiKey": "votre-cle-api-specifique",
    "outputFormat": "json"
  }'
```

### Avec JavaScript/fetch

#### Fichier standard (clé API par défaut)
```javascript
const response = await fetch('http://localhost:3000/api/audit-figma', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    figmaUrl: 'https://www.figma.com/file/abc123/Mon-Design?node-id=1%3A2',
    outputFormat: 'json'
  })
});

const result = await response.json();
console.log(result);
```

#### Fichier avec autorisations spécifiques
```javascript
const response = await fetch('http://localhost:3000/api/audit-figma', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    figmaUrl: 'https://www.figma.com/file/abc123/Mon-Design-Specifique?node-id=1%3A2',
    figmaApiKey: 'votre-cle-api-specifique',
    outputFormat: 'json'
  })
});

const result = await response.json();
console.log(result);
```

## Réponses

### Succès (200)

#### Format Markdown (défaut)
```json
{
  "success": true,
  "audit": "# 📊 Rapport d'Audit Figma\n\n## 📋 Résumé...",
  "format": "markdown"
}
```

#### Format JSON
```json
{
  "summary": {
    "totalIssues": 5,
    "issuesByRule": {
      "layer-naming": 3,
      "auto-layout-usage": 2
    }
  },
  "resultsByRule": {
    "layer-naming": [
      {
        "nodeName": "Rectangle 1",
        "nodeId": "1:23",
        "message": "Le nom du calque devrait être plus descriptif"
      }
    ]
  }
}
```

### Erreurs

#### Paramètres manquants (400)
```json
{
  "error": "Le paramètre 'figmaUrl' est requis"
}
```

#### Accès refusé - Autorisations insuffisantes (401)
```json
{
  "error": "Accès refusé au fichier Figma",
  "details": "Les autorisations par défaut ne permettent pas d'accéder à ce fichier.",
  "suggestion": "Essayez de fournir une clé API spécifique avec le paramètre 'figmaApiKey'."
}
```

#### Erreur Figma API (500)
```json
{
  "error": "Erreur lors de la récupération du contexte Figma",
  "details": "Invalid Figma URL provided."
}
```

## Gestion des clés API

### 🔑 Clé API par défaut
- **Clé configurée** : Une clé API Figma par défaut est déjà configurée dans le système
- **Accès standard** : Permet d'accéder à la plupart des fichiers Figma sans spécifier de clé
- **Simplicité** : Vous pouvez utiliser l'API sans fournir de `figmaApiKey` dans la plupart des cas

### 🎯 Clés API spécifiques
- **Autorisations particulières** : Utilisez le paramètre `figmaApiKey` pour des fichiers nécessitant des permissions spéciales
- **Fichiers d'équipe** : Certains fichiers d'organisation peuvent nécessiter une clé API spécifique
- **Accès restreint** : Pour des fichiers avec des restrictions d'accès particulières

## Comment obtenir une clé API Figma personnalisée

> **Note** : Une clé API par défaut est déjà configurée. Vous n'avez besoin d'une clé personnalisée que pour des fichiers avec des autorisations spécifiques.

1. Allez sur [Figma](https://www.figma.com)
2. Cliquez sur votre avatar en haut à droite
3. Sélectionnez "Settings"
4. Dans l'onglet "Account", faites défiler jusqu'à "Personal access tokens"
5. Cliquez sur "Create new token"
6. Donnez un nom à votre token et cliquez sur "Create token"
7. Copiez le token généré (vous ne pourrez plus le voir après)

## Types d'audits effectués

L'API effectue automatiquement les vérifications suivantes :

- ✅ **Styles détachés** : Vérifie si les éléments utilisent les styles du design system
- ✅ **Nommage des calques** : Contrôle la cohérence du nommage
- ✅ **Auto Layout** : Détecte les opportunités d'utilisation d'Auto Layout
- ✅ **Paramètres d'export** : Vérifie la configuration des exports
- ✅ **Groupes vs Frames** : Identifie les groupes qui devraient être des frames
- ✅ **Calques cachés** : Détecte les calques invisibles inutiles

## Démarrage du serveur

Pour utiliser cette API, assurez-vous que le serveur MCP Figma est démarré :

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

Le serveur démarre par défaut sur le port 3000.
