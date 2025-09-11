/**
 * @file Layer Naming Rule
 * @description This rule checks for default layer names in the Figma file, such as
 * "Frame 123" or "Rectangle 45".
 * @functionality It uses a regular expression to identify common default names assigned by
 * Figma. Using descriptive names for layers is a fundamental best practice for improving
 * the clarity and maintainability of a design file, making collaboration between designers
 * and developers much smoother.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = 2;

// Regex to detect default Figma layer names
const defaultNameRegex = /^(Frame|Group|Rectangle|Ellipse|Vector|Line|Slice|Component) \d+$/;

// Helper function to recursively check a node and its children
function checkNode(node: SimplifiedNode): AuditResult[] {
  let results: AuditResult[] = [];

  if (defaultNameRegex.test(node.name)) {
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
      results = results.concat(checkNode(child));
    }
  }

  return results;
}

export const checkLayerNaming: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node));
  }
  return allResults;
};
