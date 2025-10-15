# 🔍 Documentation des règles d'audit

Guide complet des règles d'audit Figma pour détecter les problèmes de design et les bonnes pratiques.

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Règles standards](#règles-standards)
- [Règles basées sur l'IA](#règles-basées-sur-lia)
- [Créer une règle personnalisée](#créer-une-règle-personnalisée)
- [Configuration des règles](#configuration-des-règles)

---

## 🎯 Vue d'ensemble

Le système d'audit analyse les designs Figma selon **8 règles** de bonnes pratiques, réparties en deux catégories :

### Catégories de règles

| Catégorie | Nombre | Activation | Description |
|-----------|--------|------------|-------------|
| **Standard** | 7 règles | 🟢 Automatique | Détection par pattern matching |
| **IA** | 1 règle | 🔵 Optionnelle | Analyse par LLM (Gemini) |

### Niveaux de sévérité

Les règles peuvent détecter des problèmes de différentes sévérités :

- 🔴 **Critique** : Problème majeur d'accessibilité ou d'architecture
- 🟠 **Important** : Problème de cohérence ou de maintenabilité
- 🟡 **Avertissement** : Suggestion d'amélioration

---

## 📐 Règles standards

Les règles standards sont **toujours actives** et utilisent l'analyse de patterns.

### Règle 1 : Auto Layout Usage

**Icône** : 📐
**Sévérité** : 🟠 Important
**Catégorie** : Layout

**Description**
Détecte les conteneurs avec plusieurs enfants qui n'utilisent pas Auto Layout.

**Pourquoi c'est important**
Auto Layout permet de créer des designs responsifs et maintenables. Sans Auto Layout, les éléments sont positionnés de manière absolue, rendant les modifications difficiles.

**Détection**
- Nœud de type `FRAME` ou `COMPONENT`
- Plus de 1 enfant
- `layoutMode` = `"NONE"`

**Exemple de problème**
```
Frame "Header"
  ├─ Rectangle (Logo)
  ├─ Text (Title)
  └─ Button (Action)
  ❌ Sans Auto Layout → Difficile à adapter
```

**Solution recommandée**
```
Frame "Header" (Auto Layout Horizontal)
  ├─ Rectangle (Logo)
  ├─ Text (Title)
  └─ Button (Action)
  ✅ Avec Auto Layout → Responsive et maintenable
```

**Code source** : [`check-auto-layout-usage.ts`](../src/mcp/tools/audit-figma-design/rules/check-auto-layout-usage.ts)

---

### Règle 2 : Layer Naming

**Icône** : 🏷️
**Sévérité** : 🟡 Avertissement
**Catégorie** : Organisation

**Description**
Détecte les noms par défaut générés par Figma (ex: "Frame 123", "Rectangle 45").

**Pourquoi c'est important**
Des noms explicites facilitent :
- La collaboration designer-développeur
- La navigation dans les calques
- L'export de code

**Détection**
Pattern regex : `/^(Frame|Group|Rectangle|Ellipse|Vector|Line|Slice|Component) \d+$/`

**Exemples détectés**
```
❌ Frame 123
❌ Rectangle 45
❌ Group 7
❌ Component 12
```

**Solutions recommandées**
```
✅ Header Container
✅ Icon Background
✅ Navigation Group
✅ Button Primary
```

**Code source** : [`check-layer-naming.ts`](../src/mcp/tools/audit-figma-design/rules/check-layer-naming.ts)

---

### Règle 3 : Detached Styles

**Icône** : 🎨
**Sévérité** : 🟠 Important
**Catégorie** : Design System

**Description**
Détecte les éléments utilisant des styles inline au lieu de tokens du design system.

**Pourquoi c'est important**
L'utilisation de styles détachés :
- Réduit la cohérence du design
- Complique les modifications globales
- Augmente la dette technique

**Détection**
Vérifie l'absence de :
- `fillStyleId` pour les couleurs de fond
- `strokeStyleId` pour les bordures
- `textStyleId` pour la typographie

**Exemple de problème**
```json
{
  "type": "RECTANGLE",
  "fills": [{"type": "SOLID", "color": {"r": 0.2, "g": 0.4, "b": 0.8}}],
  "fillStyleId": ""  // ❌ Pas de référence au design system
}
```

**Solution recommandée**
```json
{
  "type": "RECTANGLE",
  "fillStyleId": "S:abc123def456",  // ✅ Référence "Primary/500"
}
```

**Code source** : [`check-detached-styles.ts`](../src/mcp/tools/audit-figma-design/rules/check-detached-styles.ts)

---

### Règle 4 : Export Settings

**Icône** : 📤
**Sévérité** : 🟡 Avertissement
**Catégorie** : Developer Handoff

**Description**
Identifie les assets potentiels (icônes, images) sans configuration d'export.

**Pourquoi c'est important**
Les paramètres d'export facilitent :
- L'export automatisé des assets
- La communication avec les développeurs
- La cohérence des formats

**Détection**
Nœuds détectés :
- Type `VECTOR` sans `exportSettings`
- Images SVG sans configuration
- Noms contenant "icon", "logo", "asset"

**Exemple de configuration recommandée**
```json
{
  "exportSettings": [
    {"format": "SVG", "suffix": ""},
    {"format": "PNG", "suffix": "@2x", "constraint": {"type": "SCALE", "value": 2}}
  ]
}
```

**Code source** : [`check-export-settings.ts`](../src/mcp/tools/audit-figma-design/rules/check-export-settings.ts)

---

### Règle 6 : Groups vs Frames

**Icône** : 📦
**Sévérité** : 🟡 Avertissement
**Catégorie** : Layout

**Description**
Détecte l'utilisation de groupes au lieu de frames.

**Pourquoi c'est important**
Les frames offrent :
- Support d'Auto Layout
- Meilleure performance
- Plus de fonctionnalités (clipping, constraints)

**Détection**
- Type de nœud = `GROUP`

**Quand utiliser un groupe vs une frame**

| Situation | Recommandation |
|-----------|----------------|
| Conteneur simple | ✅ Frame |
| Layout responsive | ✅ Frame |
| Clipping mask | ✅ Frame |
| Groupement temporaire | ⚠️ Group (acceptable) |
| Transformation complexe | ⚠️ Group (acceptable) |

**Code source** : [`check-group-vs-frame.ts`](../src/mcp/tools/audit-figma-design/rules/check-group-vs-frame.ts)

---

### Règle 10 : Component Descriptions

**Icône** : 📝
**Sévérité** : 🟡 Avertissement
**Catégorie** : Documentation

**Description**
Vérifie que les composants ont des descriptions documentant leur usage.

**Pourquoi c'est important**
Les descriptions de composants :
- Documentent les cas d'usage
- Guident les autres designers
- Facilitent la maintenance

**Détection**
- Type `COMPONENT` ou `COMPONENT_SET`
- Champ `description` vide ou absent

**Exemple de bonne description**
```
Composant : Button Primary

Description :
Bouton d'action principal pour les CTA importants.

Usage :
- Limiter à 1 par page/section
- Texte court et actionnable (2-3 mots)
- Utilisé pour les actions de conversion

Variantes :
- Default, Hover, Disabled, Loading
```

**Code source** : [`check-component-descriptions.ts`](../src/mcp/tools/audit-figma-design/rules/check-component-descriptions.ts)

---

### Règle 11 : Color Contrast (WCAG)

**Icône** : ♿
**Sévérité** : 🔴 Critique
**Catégorie** : Accessibilité

**Description**
Vérifie le contraste des couleurs selon les standards WCAG 2.1.

**Pourquoi c'est important**
Un contraste insuffisant :
- Rend le contenu difficile à lire
- Exclut les personnes malvoyantes
- Non conforme aux standards d'accessibilité

**Niveaux WCAG**

| Niveau | Texte normal | Texte large | Usage |
|--------|--------------|-------------|-------|
| **AA** | 4.5:1 | 3:1 | Minimum légal |
| **AAA** | 7:1 | 4.5:1 | Recommandé |

**Détection**
Calcule le ratio de contraste entre :
- Couleur du texte
- Couleur de fond

**Exemple de problème**
```
Text "Welcome"
  Color: #888888 (gris clair)
  Background: #FFFFFF (blanc)
  Ratio: 2.85:1 ❌ FAIL (< 4.5:1)
```

**Solution**
```
Text "Welcome"
  Color: #595959 (gris foncé)
  Background: #FFFFFF (blanc)
  Ratio: 4.54:1 ✅ PASS AA
```

**Outils de test** : [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Code source** : [`check-color-contrast.ts`](../src/mcp/tools/audit-figma-design/rules/check-color-contrast.ts)

---

### Règle 12 : Typography (WCAG)

**Icône** : 📝
**Sévérité** : 🔴 Critique
**Catégorie** : Accessibilité

**Description**
Vérifie la taille et la hauteur de ligne du texte selon WCAG.

**Critères WCAG**

| Critère | Minimum | Recommandé |
|---------|---------|------------|
| **Taille de police** | 16px | 16-18px |
| **Line height** | 1.5x | 1.5-1.8x |

**Détection**
- Taille de police < 16px
- Line height < 1.5x taille de police

**Exemple de problème**
```json
{
  "fontSize": 12,           // ❌ Trop petit
  "lineHeightPx": 16,       // ❌ 1.33x (< 1.5x)
}
```

**Solution**
```json
{
  "fontSize": 16,           // ✅ Taille appropriée
  "lineHeightPx": 24,       // ✅ 1.5x
}
```

**Exceptions acceptables**
- Texte décoratif (non essentiel)
- Labels de UI très petits (avec alternatives)
- Footnotes et mentions légales (peut être 14px)

**Code source** : [`check-typography.ts`](../src/mcp/tools/audit-figma-design/rules/check-typography.ts)

---

## 🤖 Règles basées sur l'IA

### Activation des règles IA

> [!WARNING]
> Les règles IA sont **désactivées par défaut** pour des raisons de coût et de performance.

**Pour activer** :

```bash
# Dans votre .env
ENABLE_AI_RULES=true
GOOGLE_CLOUD_PROJECT=your_project_id
```

**Configuration ADC** :
```bash
gcloud auth application-default login
```

---

### Règle 9 : Color Naming

**Icône** : 🌈
**Sévérité** : 🟠 Important
**Catégorie** : Design System
**Type** : 🤖 IA Active (Gemini 2.0 Flash)

**Description**
Analyse les noms de couleurs du design system et suggère des noms sémantiques.

**Pourquoi c'est important**
Des noms sémantiques :
- Facilitent la compréhension de l'intention
- Permettent de changer les valeurs sans renommer
- Améliorent la maintenabilité

**Détection IA**
L'IA analyse chaque nom de couleur et détecte :
- Noms littéraux (décrivent la couleur)
- Noms sémantiques (décrivent l'usage)

**Exemples analysés**

| Nom actuel | Type | Suggestion IA | Raison |
|------------|------|---------------|---------|
| `Blue` | ❌ Littéral | `Primary` | Usage principal |
| `Red-500` | ❌ Littéral | `Error-500` | Indique une erreur |
| `Light Gray` | ❌ Littéral | `Background-Secondary` | Fond secondaire |
| `Primary-600` | ✅ Sémantique | - | Déjà sémantique |
| `Text-Muted` | ✅ Sémantique | - | Déjà sémantique |

**Prompt IA**
L'IA reçoit :
- Liste des noms de couleurs
- Valeurs hexadécimales
- Contexte du design system

Et retourne :
- Classification (littéral vs sémantique)
- Suggestions de noms sémantiques
- Justification

**Exemple de sortie**
```json
{
  "styleName": "Blue",
  "currentName": "Blue",
  "isLiteral": true,
  "suggestedName": "Primary",
  "reasoning": "Cette couleur est utilisée pour les actions principales et les éléments interactifs. Un nom comme 'Primary' communique mieux son intention d'usage."
}
```

**Modèle utilisé** : `gemini-2.0-flash-exp`
**Tokens max** : 8192
**Température** : 0.9

**Code source** : [`check-color-names.ts`](../src/mcp/tools/audit-figma-design/rules/check-color-names.ts)

---

## 🛠️ Créer une règle personnalisée

### Structure d'une règle

Toutes les règles suivent la même interface :

```typescript
import type { AuditRule } from "../types";

export const myCustomRule: AuditRule = {
  id: 100,                    // ID unique
  name: "Ma règle custom",
  description: "Description de la règle...",
  icon: "🔍",
  category: "standard",       // ou "ai"

  check: (node, context) => {
    // Votre logique de détection
    if (/* condition */) {
      return {
        nodeId: node.id,
        nodeName: node.name,
        ruleIds: [100],
        message: "Problème détecté", // optionnel
      };
    }
    return null; // Pas de problème
  },
};
```

### Exemple : Détecter les images sans nom ALT

```typescript
export const checkMissingAltText: AuditRule = {
  id: 101,
  name: "Texte ALT manquant",
  description: "Vérifie que les images ont un texte alternatif pour l'accessibilité",
  icon: "🖼️",
  category: "standard",

  check: (node, context) => {
    // Détecter les rectangles avec des images
    const isImage = node.type === "RECTANGLE" &&
                    node.fills?.some(f => f.type === "IMAGE");

    if (!isImage) return null;

    // Vérifier si un texte ALT est présent (via le nom ou description)
    const hasAltText = node.name && !node.name.startsWith("Rectangle");

    if (!hasAltText) {
      return {
        nodeId: node.id,
        nodeName: node.name,
        ruleIds: [101],
        message: `Image sans texte alternatif. Ajoutez une description pour l'accessibilité.`,
      };
    }

    return null;
  },
};
```

### Enregistrer la règle

Ajoutez votre règle dans `rules-registry.ts` :

```typescript
import { myCustomRule } from "./rules/my-custom-rule";

export const auditRules: AuditRule[] = [
  checkAutoLayoutUsage,
  checkLayerNaming,
  // ... autres règles
  myCustomRule,  // ← Votre règle
];
```

---

## ⚙️ Configuration des règles

### Activer/Désactiver des règles

Modifiez `rules-registry.ts` :

```typescript
export const auditRules: AuditRule[] = [
  checkAutoLayoutUsage,
  checkLayerNaming,
  // checkDetachedStyles,  // ← Désactivée (commentée)
  checkExportSettings,
];
```

### Filtrer par catégorie

```typescript
// Uniquement les règles standards
const standardRules = auditRules.filter(r => r.category === "standard");

// Uniquement les règles IA
const aiRules = auditRules.filter(r => r.category === "ai");
```

### Configurer la sévérité (futur)

> [!NOTE]
> Fonctionnalité en développement

```typescript
export const myRule: AuditRule = {
  // ...
  severity: "critical" | "important" | "warning",
};
```

---

## 📊 Rapport d'audit

### Format de sortie

Le rapport d'audit contient :

```typescript
{
  rulesDefinitions: [/* Définition de chaque règle */],
  results: [/* Problèmes détectés */],
  designSystem: {
    colors: [...],
    typography: [...],
    components: [...]
  },
  componentSuggestions: [/* Suggestions de composants à créer */]
}
```

### Exemple de résultat

```json
{
  "nodeId": "123:456",
  "nodeName": "Frame 789",
  "ruleIds": [2],
  "message": "Nom par défaut détecté"
}
```

---

## 📚 Ressources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Figma Best Practices](https://www.figma.com/best-practices/)
- [Design System Checklist](https://www.designsystemchecklist.com/)

**Retour** : [📖 README principal](../README.md)
