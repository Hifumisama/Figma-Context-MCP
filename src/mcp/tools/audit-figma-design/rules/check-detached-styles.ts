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

  // The properties to exclude from this check as they are handled by other rules.
  const excludedProperties = ['layout', 'text'];

  // Check for detached styles by looking for local variable references
  if (node.localVariableRefs) {
    const detachedProperties: string[] = [];
    
    for (const [prop, refId] of Object.entries(node.localVariableRefs)) {
      // Skip properties that are handled by other rules
      if (excludedProperties.includes(prop)) {
        continue;
      }

      const localStyle = globalVars.localVariables[refId];
      
      // Skip 'fills' property if it contains an image, as this is handled by export-settings rule
      if (localStyle && localStyle[0] && localStyle[0].type === 'IMAGE') {
        continue;
      }

      if (localStyle) {
        // Collect detailed information about the detached property
        const styleValue = Array.isArray(localStyle) ? localStyle[0] : localStyle;
        let propertyDetail = "";
        
        if (styleValue.type === 'SOLID' && styleValue.color) {
          const { r, g, b } = styleValue.color;
          const hex = `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
          propertyDetail = hex;
        } else {
          propertyDetail = JSON.stringify(styleValue);
        }
        
        detachedProperties.push(`Propriété ${prop}: ${propertyDetail}`);
      }
    }
    
    // If we found detached properties, create a single result for this node
    if (detachedProperties.length > 0) {
      results.push({
        ruleIds: [RULE_ID],
        nodeId: node.id,
        nodeName: node.name,
        moreInfos: { [RULE_ID.toString()]: detachedProperties.join(", ") }
      });
    }
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
