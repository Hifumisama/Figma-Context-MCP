import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = "auto-layout-usage";

// Helper function to recursively check a node and its children
function checkNode(node: SimplifiedNode): AuditResult[] {
  let results: AuditResult[] = [];

  // A container with multiple children that doesn't use Auto Layout is a candidate for this rule.
  // We check if layout property does not contain 'AUTO'. The simplified extractor puts 'AUTO' if it's an auto-layout.
  const isCandidate = (node.type === 'FRAME' || node.type === 'GROUP') &&
                      (node.children && node.children.length > 1) &&
                      (!node.layout || !node.layout.includes('AUTO'));

  if (isCandidate) {
    results.push({
      ruleId: RULE_ID,
      message: `The layer "${node.name}" contains multiple children but does not use Auto Layout. Consider converting it to an Auto Layout frame for better responsive behavior.`,
      nodeId: node.id,
      nodeName: node.name,
    });
  }

  // Recursively check children
  if (node.children) {
    for (const child of node.children) {
      results = results.concat(checkNode(child));
    }
  }

  return results;
}

export const checkAutoLayoutUsage: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node));
  }
  return allResults;
};
