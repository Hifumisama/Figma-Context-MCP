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

const RULE_ID = 3;

// Helper function to recursively check a node and its children
function checkNode(node: SimplifiedNode, globalVars: any): AuditResult[] {
  let results: AuditResult[] = [];

  // Check for detached styles by looking for references to local styles instead of design system
  const detachedProperties: string[] = [];
  
  // Check fills
  if (node.fills && typeof node.fills === 'string') {
    // If it references localStyles instead of designSystem, it's detached
    if (globalVars.localStyles.fills[node.fills]) {
      detachedProperties.push('fills');
    }
  }
  
  // Check strokes  
  if (node.strokes && typeof node.strokes === 'string') {
    if (globalVars.localStyles.strokes[node.strokes]) {
      detachedProperties.push('strokes');
    }
  }
  
  // Check effects
  if (node.effects && typeof node.effects === 'string') {
    if (globalVars.localStyles.effects[node.effects]) {
      detachedProperties.push('effects');
    }
  }
  
  // Check text styles
  if (node.textStyle && typeof node.textStyle === 'string') {
    if (globalVars.localStyles.text[node.textStyle]) {
      detachedProperties.push('textStyle');
    }
  }

  if (detachedProperties.length > 0) {
    results.push({
      ruleIds: [RULE_ID],
      nodeId: node.id,
      nodeName: node.name,
      moreInfos: { [RULE_ID.toString()]: `Propriétés détachées: ${detachedProperties.join(", ")}` }
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

export const checkDetachedStyles: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node, context.globalVars));
  }
  return allResults;
};
