import type { FigmaContext } from "../get-figma-context/types.js";

export type AuditRule = (context: FigmaContext) => AuditResult[];

export interface AuditResult {
  ruleId: string;
  message: string;
  nodeId: string;
  nodeName: string;
}

export interface AuditReport {
  results: AuditResult[];
  summary: {
    totalIssues: number;
    issuesByRule: Record<string, number>;
  };
}
