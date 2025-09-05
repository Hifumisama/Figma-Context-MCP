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
| `figmaApiKey` | string | ❌ | Votre clé API Figma personnelle (requis pour les fichiers privés) |
| `outputFormat` | string | ❌ | Format de sortie : `"json"` (défaut) ou `"markdown"` |

## Exemple d'utilisation

### Avec curl

#### Fichier public (sans clé API)
```bash
curl -X POST http://localhost:3000/api/audit-figma \
  -H "Content-Type: application/json" \
  -d '{
    "figmaUrl": "https://www.figma.com/file/abc123/Mon-Design-Public?node-id=1%3A2",
    "outputFormat": "json"
  }'
```

#### Fichier privé (avec clé API)
```bash
curl -X POST http://localhost:3000/api/audit-figma \
  -H "Content-Type: application/json" \
  -d '{
    "figmaUrl": "https://www.figma.com/file/abc123/Mon-Design-Prive?node-id=1%3A2",
    "figmaApiKey": "votre-cle-api-figma",
    "outputFormat": "json"
  }'
```

### Avec JavaScript/fetch

#### Fichier public
```javascript
const response = await fetch('http://localhost:3000/api/audit-figma', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    figmaUrl: 'https://www.figma.com/file/abc123/Mon-Design-Public?node-id=1%3A2',
    outputFormat: 'json'
  })
});

const result = await response.json();
console.log(result);
```

#### Fichier privé
```javascript
const response = await fetch('http://localhost:3000/api/audit-figma', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    figmaUrl: 'https://www.figma.com/file/abc123/Mon-Design-Prive?node-id=1%3A2',
    figmaApiKey: 'votre-cle-api-figma',
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

#### Accès refusé - Fichier privé sans clé API (401)
```json
{
  "error": "Accès refusé au fichier Figma",
  "details": "Ce fichier n'est pas public. Veuillez fournir une clé API Figma valide avec le paramètre 'figmaApiKey'.",
  "suggestion": "Obtenez une clé API sur https://www.figma.com/developers/api#access-tokens"
}
```

#### Accès refusé - Clé API invalide (401)
```json
{
  "error": "Accès refusé au fichier Figma",
  "details": "La clé API fournie n'a pas accès à ce fichier, ou le fichier n'existe pas.",
  "suggestion": "Vérifiez que votre clé API est valide et que le fichier existe."
}
```

#### Erreur Figma API (500)
```json
{
  "error": "Erreur lors de la récupération du contexte Figma",
  "details": "Invalid Figma URL provided."
}
```

## Fichiers publics vs privés

### 🌐 Fichiers publics
- **Aucune clé API requise** : Les fichiers Figma rendus publics par leur propriétaire peuvent être auditées sans authentification
- **Partage public** : Le fichier doit avoir été explicitement rendu public via les paramètres de partage Figma
- **Limitation** : Seuls les fichiers avec un lien de partage public fonctionnent sans clé API

### 🔒 Fichiers privés
- **Clé API requise** : Tous les autres fichiers nécessitent une clé API valide
- **Accès personnel** : Vous devez avoir accès au fichier avec votre compte Figma
- **Équipes/organisations** : Les fichiers d'équipe nécessitent une clé API du membre de l'équipe

## Comment obtenir votre clé API Figma

> **Note** : La clé API n'est nécessaire que pour les fichiers privés. Essayez d'abord sans clé API si le fichier pourrait être public.

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
