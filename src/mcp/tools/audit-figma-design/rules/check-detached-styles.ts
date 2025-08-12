/**
 * @file Detached Styles Rule
 * @description This rule identifies elements that use "detached" or inline styles instead of
 * linking to a shared, global style from the Design System.
 * @functionality It recursively traverses the node tree, checking properties like `fills`,
 * `strokes`, and `textStyle`. If a style value is a raw string (e.g., a hex code)
 * instead of a style reference (e.g., "styles:..."), it's flagged as a detached style,
 * which hinders maintainability.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = "detached-styles";

// Helper function to recursively check a node and its children
function checkNode(node: SimplifiedNode): AuditResult[] {
  let results: AuditResult[] = [];

  // Check for detached styles on the current node
  const checkProperties: (keyof SimplifiedNode)[] = ['fills', 'strokes', 'textStyle'];
  for (const prop of checkProperties) {
    const value = node[prop];
    // A "detached" style is assumed to be any plain string value that doesn't look like a style reference.
    // The extractor replaces linked styles with a "styles:..." reference.
    if (typeof value === 'string' && value && !value.startsWith('styles:')) {
      results.push({
        ruleId: RULE_ID,
        message: `The property "${prop}" uses a detached style ("${value}"). It should be linked to a shared style.`,
        nodeId: node.id,
        nodeName: node.name,
      });
    }
  }

  // Recursively check children
  if (node.children) {
    for (const child of node.children) {
      results = results.concat(checkNode(child));
    }
  }

  return results;
}

export const checkDetachedStyles: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node));
  }
  return allResults;
};
