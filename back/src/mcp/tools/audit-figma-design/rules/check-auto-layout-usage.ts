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

const RULE_ID = 1;

// Helper function to recursively check a node and its children
function checkNode(node: SimplifiedNode, globalVars: any): AuditResult[] {
  let results: AuditResult[] = [];

  // Check if the node has auto-layout by looking for layout references
  const hasAutoLayoutMode = node.type === 'FRAME' && 
    (Object.values(globalVars.localStyles.layout || {}).some((layout: any) => 
      layout.mode && ['column', 'row'].includes(layout.mode)) ||
     Object.values(globalVars.designSystem.layout || {}).some((layout: any) => 
      layout.value && layout.value.mode && ['column', 'row'].includes(layout.value.mode)));
  
  const isCandidate = (node.type === 'FRAME' || node.type === 'GROUP') &&
                      (node.children && node.children.length > 1) &&
                      !hasAutoLayoutMode;

  if (isCandidate) {
    results.push({
      ruleIds: [RULE_ID],
      nodeId: node.id,
      nodeName: node.name,
      moreInfos: {}
    });
  }

  // Recursively check children
  if (node.children) {
    for (const child of node.children) {
      results = results.concat(checkNode(child, globalVars));
    }
  }

  return results;
}

export const checkAutoLayoutUsage: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node, context.globalVars));
  }
  return allResults;
};
