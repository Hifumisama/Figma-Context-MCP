/**
 * @file Types for Audit Figma Design Tool
 * @description This file defines the core data structures for the design audit process.
 * It specifies the shape of an `AuditResult` for individual issues, the function signature
 * for an `AuditRule`, and the final `AuditReport` which aggregates all findings into a
 * structured and summarized format.
 */
import type { FigmaContext } from "../get-figma-context/types.js";

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

export interface AuditReport {
  rulesDefinitions: RuleDefinition[];
  results: AuditResult[];
}
