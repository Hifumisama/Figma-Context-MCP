/**
 * @file Rules Registry
 * @description Registry containing all audit rules definitions with French labels,
 * descriptions, resolution advice, icons, and colors.
 */
import type { RuleDefinition } from "./types.js";

export const RULES_REGISTRY: RuleDefinition[] = [
  {
    id: 1,
    name: "Utilisation d'Auto Layout",
    description: "Les conteneurs avec plusieurs enfants devraient utiliser Auto Layout pour une meilleure flexibilité et réactivité",
    resolutionAdvice: "Activer Auto Layout dans les propriétés du frame pour permettre un redimensionnement automatique et une organisation flexible des éléments",
    icon: "📐",
    color: "#3B82F6",
    category: "standard"
  },
  {
    id: 2,
    name: "Nommage des calques",
    description: "Éviter les noms par défaut de Figma comme \"Frame 123\". Utiliser une convention claire (ex: btn-primary)",
    resolutionAdvice: "Renommer les calques avec une convention claire et descriptive (ex: btn-primary, card-content, header-logo)",
    icon: "🏷️",
    color: "#10B981",
    category: "standard"
  },
  {
    id: 3,
    name: "Styles détachés",
    description: "Utiliser les tokens du Design System plutôt que les styles inline pour maintenir la cohérence",
    resolutionAdvice: "Reconnecter aux styles du Design System ou créer de nouveaux styles partagés pour remplacer les valeurs inline",
    icon: "🎨",
    color: "#EF4444",
    category: "standard"
  },
  {
    id: 4,
    name: "Paramètres d'export",
    description: "Les assets doivent avoir une configuration d'export appropriée pour l'optimisation",
    resolutionAdvice: "Configurer les paramètres d'export (format, résolution, suffixe) pour les éléments destinés aux développeurs",
    icon: "📤",
    color: "#F59E0B",
    category: "standard"
  },
  {
    id: 5,
    name: "Calques masqués",
    description: "Nettoyer les fichiers en supprimant les calques masqués ou en les rendant visibles",
    resolutionAdvice: "Supprimer les calques masqués inutiles ou les rendre visibles s'ils sont nécessaires",
    icon: "👁️",
    color: "#8B5CF6",
    category: "standard"
  },
  {
    id: 6,
    name: "Groupes vs Frames",
    description: "Utiliser des frames plutôt que des groupes pour un layout approprié et des fonctionnalités avancées",
    resolutionAdvice: "Convertir les groupes en frames pour bénéficier des fonctionnalités avancées (Auto Layout, contraintes, etc.)",
    icon: "📦",
    color: "#EC4899",
    category: "standard"
  },
  {
    id: 7,
    name: "Candidats à la composantisation",
    description: "Motifs répétés qui pourraient être convertis en composants réutilisables",
    resolutionAdvice: "Créer un composant réutilisable pour ce pattern répété afin d'améliorer la maintenabilité",
    icon: "🧩",
    color: "#6366F1",
    category: "ai-based"
  },
  {
    id: 8,
    name: "États d'interaction",
    description: "Les composants interactifs doivent avoir tous leurs états (hover, focus, disabled)",
    resolutionAdvice: "Ajouter les états manquants (hover, focus, active, disabled) sous forme de variants du composant",
    icon: "🔄",
    color: "#14B8A6",
    category: "ai-based"
  },
  {
    id: 9,
    name: "Nommage des couleurs",
    description: "Utiliser des noms sémantiques (primary, secondary) plutôt que des noms littéraux (bleu, rouge)",
    resolutionAdvice: "Renommer les couleurs avec des noms sémantiques qui reflètent leur usage plutôt que leur apparence",
    icon: "🌈",
    color: "#F97316",
    category: "ai-based"
  }
];

/**
 * Get rule definition by ID
 */
export function getRuleDefinition(id: number): RuleDefinition | undefined {
  return RULES_REGISTRY.find(rule => rule.id === id);
}

/**
 * Get all rule definitions
 */
export function getAllRuleDefinitions(): RuleDefinition[] {
  return RULES_REGISTRY;
}

/**
 * Get rule definitions by category
 */
export function getRuleDefinitionsByCategory(category: 'standard' | 'ai-based'): RuleDefinition[] {
  return RULES_REGISTRY.filter(rule => rule.category === category);
}