/**
 * @file Missing Interaction States Rule
 * @description This rule checks if interactive components (like buttons, inputs) have defined
 * variants for common interaction states (e.g., hover, focus, disabled).
 * @functionality It identifies components likely to be interactive based on keywords in their
 * names. It then groups them by a base name (e.g., "button/primary") and checks if variants
 * for standard states like "hover" or "focus" exist within that group. Missing states
 * are reported to ensure a complete and usable component set.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = "missing-interaction-states";

const INTERACTIVE_KEYWORDS = ['button', 'input', 'select', 'toggle', 'checkbox', 'radio', 'switch', 'slider', 'tab'];
const INTERACTION_STATES = ['hover', 'focus', 'active', 'disabled'];

export const checkInteractionStates: AuditRule = (context) => {
  const componentNodes: SimplifiedNode[] = [];
  const results: AuditResult[] = [];

  // 1. Find all component nodes
  function findComponents(nodes: SimplifiedNode[]) {
    for (const node of nodes) {
      if (node.type === 'COMPONENT') {
        componentNodes.push(node);
      }
      if (node.children) {
        findComponents(node.children);
      }
    }
  }
  findComponents(context.nodes);

  // 2. Identify interactive components
  const interactiveComponents = componentNodes.filter(node => 
    INTERACTIVE_KEYWORDS.some(keyword => node.name.toLowerCase().includes(keyword))
  );

  // 3. Group by base name (e.g., all "button/primary" variants together)
  const componentsByBaseName = new Map<string, SimplifiedNode[]>();
  for (const comp of interactiveComponents) {
      // A simple way to get a base name is to remove state suffixes
      let baseName = comp.name;
      INTERACTION_STATES.forEach(state => {
          baseName = baseName.replace(new RegExp(`/${state}$`, 'i'), '');
      });

      if (!componentsByBaseName.has(baseName)) {
          componentsByBaseName.set(baseName, []);
      }
      componentsByBaseName.get(baseName)!.push(comp);
  }

  // 4. Check for missing states in each group
  for (const [baseName, group] of componentsByBaseName.entries()) {
    const existingStates = new Set(
        group.map(comp => {
            const match = comp.name.match(new RegExp(`/${INTERACTION_STATES.join('|')}$`, 'i'));
            return match ? match[0].toLowerCase().substring(1) : 'default';
        })
    );

    const missingStates = INTERACTION_STATES.filter(state => !existingStates.has(state));

    if (missingStates.length > 0) {
      // Report the issue on the first component of the group
      const firstComponent = group[0];
      results.push({
        ruleId: RULE_ID,
        message: `The interactive component "${baseName}" seems to be missing variants for the following states: ${missingStates.join(', ')}.`,
        nodeId: firstComponent.id,
        nodeName: firstComponent.name,
      });
    }
  }

  return results;
};
