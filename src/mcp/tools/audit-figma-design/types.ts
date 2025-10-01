/**
 * @file Types for Audit Figma Design Tool
 * @description This file defines the core data structures for the design audit process.
 * It specifies the shape of an `AuditResult` for individual issues, the function signature
 * for an `AuditRule`, and the final `AuditReport` which aggregates all findings into a
 * structured and summarized format.
 */
import type { FigmaContext } from "../get-figma-context/types.js";
import type { DesignSystemStyles } from "../../../extractors/types.js";

export type AuditRule = (context: FigmaContext) => AuditResult[];
export type AsyncAuditRule = (context: FigmaContext) => Promise<AuditResult[]>;

export interface RuleDefinition {
  id: number;
  name: string;
  description: string;
  resolutionAdvice: string;
  icon: string;
  color: string;
  category: 'standard' | 'ai-based';
  state: 'enabled' | 'disabled' | 'error' | 'pending';
  errorMessage?: string;
}

export interface AuditResult {
  ruleIds: number[];
  nodeId: string;
  nodeName: string;
  moreInfos: Record<string, string>; // Objet JSON avec ruleId comme clé et détail comme valeur
}

export interface ComponentSuggestion {
  componentName: string;     // camelCase
  description: string;       // courte mais cohérente en français
  rootNodeId: string;        // ID de la node racine du pattern (première instance)
  rootNodeName: string;      // Nom de la node racine (première instance)
  possibleInstances: {       // Toutes les instances où ce composant peut être appliqué
    name: string;
    nodeId: string;
  }[];
  usableNodes: {             // arborescence complète de la première instance
    name: string;
    nodeId: string;
  }[];
}

export interface AuditReport {
  rulesDefinitions: RuleDefinition[];
  results: AuditResult[];
  designSystem?: DesignSystemStyles;
  componentSuggestions?: ComponentSuggestion[];
  figmaAiDescription?: string;
}
