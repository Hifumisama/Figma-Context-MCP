/**
 * @file Find Component Candidates Rule
 * @description This rule identifies groups of nodes that are not components but have similar
 * structures and dimensions, suggesting they could be refactored into a single reusable component.
 * @functionality It traverses the design tree, skipping any existing components or instances.
 * For regular nodes (frames, groups, etc.), it generates a structural "signature" based on the
 * node's type, its children's types, and font styles. It then groups nodes with identical signatures and
 * similar dimensions. If a group contains multiple similar nodes, it's flagged as a candidate
 * for componentization, helping to improve design system consistency and maintainability.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = "find-component-candidates";

interface NodeProfile {
  id: string;
  name: string;
  node: SimplifiedNode;
  signature: string;
  width: number;
  height: number;
}

/**
 * Generates a structural signature for a given node.
 * The signature includes the node's type, its direct children's types,
 * and a summary of unique font styles found in any descendant TEXT nodes.
 * Example: 'FRAME(RECTANGLE,TEXT,TEXT)[FONT(Poppins,12,400);FONT(Roboto,14,700)]'
 * @param node The simplified node to generate a signature for.
 * @param localVariables The map of local style variables from the Figma data.
 * @returns A string representing the node's structure and text styles.
 */
function generateSignature(node: SimplifiedNode, localVariables: any): string {
  // 1. Get direct children types, sorted to ensure consistency
  const childTypes = (node.children ?? []).map(child => child.type).sort().join(',');

  // 2. Recursively find all unique text styles within the node and its descendants
  const textStyles = new Set<string>();
  function findTextStyles(currentNode: SimplifiedNode) {
    if (currentNode.type === 'TEXT' && currentNode.localVariableRefs?.text) {
      const textStyleRef = currentNode.localVariableRefs.text;
      const style = localVariables[textStyleRef];
      if (style) {
        textStyles.add(`FONT(${style.fontFamily},${style.fontSize},${style.fontWeight})`);
      }
    }
    if (currentNode.children) {
      currentNode.children.forEach(findTextStyles);
    }
  }
  findTextStyles(node);

  const sortedStyles = Array.from(textStyles).sort();

  let signature = `${node.type}(${childTypes})`;
  if (sortedStyles.length > 0) {
    signature += `[${sortedStyles.join(';')}]`;
  }
  return signature;
}

/**
 * Checks if two dimensions are similar within a given tolerance.
 * @param dim1 First dimension.
 * @param dim2 Second dimension.
 * @param tolerance The allowed percentage difference (e.g., 0.2 for 20%).
 * @returns True if dimensions are similar, false otherwise.
 */
function areDimensionsSimilar(dim1: number, dim2: number, tolerance = 0.2): boolean {
    if (dim1 === 0 || dim2 === 0) return dim1 === dim2; // Avoid division by zero, treat as similar only if both are zero
    const ratio = dim1 > dim2 ? dim2 / dim1 : dim1 / dim2;
    return ratio >= (1 - tolerance);
}

export const findComponentCandidates: AuditRule = (context) => {
  const candidateNodes: SimplifiedNode[] = [];
  const localVariables = context.globalVars?.localVariables ?? {};

  // 1. Traverse the tree to find all nodes that are NOT already components or instances.
  function findCandidates(nodes: SimplifiedNode[]) {
    for (const node of nodes) {
      const nodeType = node.type;
      // This check correctly excludes component definitions (COMPONENT), variants (part of a COMPONENT_SET),
      // and instances of components (INSTANCE), as requested.
      if (nodeType === 'COMPONENT' || nodeType === 'COMPONENT_SET' || nodeType === 'INSTANCE') {
        // Skip existing components and their children to avoid analyzing them.
        continue;
      }

      // We only want to consider container-like nodes that have children.
      if (node.children && node.children.length > 0) {
          candidateNodes.push(node);
      }
      
      if (node.children) {
        findCandidates(node.children);
      }
    }
  }
  findCandidates(context.nodes);

  // 2. Create a profile for each candidate node, including the new signature.
  const profiles: NodeProfile[] = candidateNodes.map(node => ({
    id: node.id,
    name: node.name,
    node: node,
    signature: generateSignature(node, localVariables),
    width: node.absoluteBoundingBox?.width ?? 0,
    height: node.absoluteBoundingBox?.height ?? 0,
  }));

  // 3. Group profiles by the new, more detailed structural signature.
  const profilesBySignature = new Map<string, NodeProfile[]>();
  for (const profile of profiles) {
    if (!profilesBySignature.has(profile.signature)) {
      profilesBySignature.set(profile.signature, []);
    }
    profilesBySignature.get(profile.signature)!.push(profile);
  }

  // 4. Filter groups to find clusters of dimensionally-similar nodes.
  const finalCandidateGroups: NodeProfile[][] = [];
  for (const group of profilesBySignature.values()) {
    // We only care about signatures that appear more than once.
    if (group.length <= 1) continue;

    const processedIndices = new Set<number>();

    for (let i = 0; i < group.length; i++) {
      if (processedIndices.has(i)) continue;
      
      const refProfile = group[i];
      const similarGroup = [refProfile];
      processedIndices.add(i);

      for (let j = i + 1; j < group.length; j++) {
        if (processedIndices.has(j)) continue;

        const otherProfile = group[j];
        if (
          areDimensionsSimilar(otherProfile.width, refProfile.width) &&
          areDimensionsSimilar(otherProfile.height, refProfile.height)
        ) {
          similarGroup.push(otherProfile);
          processedIndices.add(j);
        }
      }
      
      if (similarGroup.length > 1) {
        finalCandidateGroups.push(similarGroup);
      }
    }
  }
  
  // 5. Format the results according to the AuditResult interface.
  const results: AuditResult[] = finalCandidateGroups.map(group => {
    const componentNames = group.map(p => `"${p.name}" (ID: ${p.id})`).join(', ');
    const firstNode = group[0];
    return {
      ruleId: RULE_ID,
      message: `Found a group of ${group.length} similar nodes that could be a component: ${componentNames}. They share the same structure, styles, and similar dimensions.`,
      nodeId: firstNode.id,
      nodeName: firstNode.name,
    };
  });

  return results;
};
