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
    category: "standard",
    state: "enabled"
  },
  {
    id: 2,
    name: "Nommage des calques",
    description: "Éviter les noms par défaut de Figma comme \"Frame 123\". Utiliser une convention claire (ex: btn-primary)",
    resolutionAdvice: "Renommer les calques avec une convention claire et descriptive (ex: btn-primary, card-content, header-logo)",
    icon: "🏷️",
    color: "#10B981",
    category: "standard",
    state: "enabled"
  },
  {
    id: 3,
    name: "Styles détachés",
    description: "Utiliser les tokens du Design System plutôt que les styles inline pour maintenir la cohérence",
    resolutionAdvice: "Reconnecter aux styles du Design System ou créer de nouveaux styles partagés pour remplacer les valeurs inline",
    icon: "🎨",
    color: "#EF4444",
    category: "standard",
    state: "enabled"
  },
  {
    id: 4,
    name: "Paramètres d'export",
    description: "Les assets doivent avoir une configuration d'export appropriée pour l'optimisation",
    resolutionAdvice: "Configurer les paramètres d'export (format, résolution, suffixe) pour les éléments destinés aux développeurs",
    icon: "📤",
    color: "#F59E0B",
    category: "standard",
    state: "enabled"
  },
  {
    id: 6,
    name: "Groupes vs Frames",
    description: "Utiliser des frames plutôt que des groupes pour un layout approprié et des fonctionnalités avancées",
    resolutionAdvice: "Convertir les groupes en frames pour bénéficier des fonctionnalités avancées (Auto Layout, contraintes, etc.)",
    icon: "📦",
    color: "#EC4899",
    category: "standard",
    state: "enabled"
  },
  {
    id: 8,
    name: "États d'interaction",
    description: "Les composants interactifs doivent avoir tous leurs états (hover, focus, disabled)",
    resolutionAdvice: "Ajouter les états manquants (hover, focus, active, disabled) sous forme de variants du composant",
    icon: "🔄",
    color: "#14B8A6",
    category: "ai-based",
    state: "enabled"
  },
  {
    id: 9,
    name: "Nommage des couleurs",
    description: "Utiliser des noms sémantiques (primary, secondary) plutôt que des noms littéraux (bleu, rouge)",
    resolutionAdvice: "Renommer les couleurs avec des noms sémantiques qui reflètent leur usage plutôt que leur apparence",
    icon: "🌈",
    color: "#F97316",
    category: "ai-based",
    state: "enabled"
  },
  {
    id: 10,
    name: "Descriptions des composants",
    description: "Les composants et composant sets doivent avoir une description pour faciliter la documentation",
    resolutionAdvice: "Ajouter une description claire et utile pour chaque composant afin d'améliorer la collaboration équipe",
    icon: "📝",
    color: "#22D3EE",
    category: "standard",
    state: "enabled"
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

/**
 * Get enabled rule definitions only
 */
export function getEnabledRuleDefinitions(): RuleDefinition[] {
  return RULES_REGISTRY.filter(rule => rule.state === 'enabled');
}

/**
 * Update rule state dynamically
 */
export function updateRuleState(ruleId: number, state: RuleDefinition['state'], errorMessage?: string): boolean {
  const rule = RULES_REGISTRY.find(rule => rule.id === ruleId);
  if (!rule) return false;
  
  rule.state = state;
  if (errorMessage) {
    rule.errorMessage = errorMessage;
  } else {
    delete rule.errorMessage;
  }
  
  return true;
}