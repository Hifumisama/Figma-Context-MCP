/**
 * @file Auto Layout Usage Rule
 * @description This rule checks for containers (FRAMEs or GROUPs) that have multiple
 * children but do not use Auto Layout.
 * @functionality It recursively traverses the node tree and identifies nodes that are candidates
 * for conversion to Auto Layout, which is crucial for responsive and maintainable designs.
 * It suggests converting these nodes to improve consistency and development handoff.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode, StyleTypes } from "../../../../extractors/types.js";

const RULE_ID = "auto-layout-usage";

// Helper function to recursively check a node and its children
function checkNode(node: SimplifiedNode, localVariables: any): AuditResult[] {
  let results: AuditResult[] = [];

  // A container with multiple children that doesn't use Auto Layout is a candidate for this rule.
  // We check if layout property does not contain 'AUTO'. The simplified extractor puts 'AUTO' if it's an auto-layout.
  // We also check if there's a 'mode' property in localVariableRefs with 'column' or 'row' values, which indicates auto-layout.
  const layoutRef = node.localVariableRefs?.layout && localVariables[node.localVariableRefs.layout].mode;
  const hasAutoLayoutMode = layoutRef && ['column', 'row'].includes(layoutRef as string);
  
  const isCandidate = (node.type === 'FRAME' || node.type === 'GROUP') &&
                      (node.children && node.children.length > 1) &&
                      !hasAutoLayoutMode;

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
      results = results.concat(checkNode(child, localVariables));
    }
  }

  return results;
}

export const checkAutoLayoutUsage: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node, context.globalVars.localVariables));
  }
  return allResults;
};
