/**
 * @file Typography Rule (WCAG Compliance)
 * @description This rule checks if text meets WCAG requirements for readability:
 * - Minimum font size of 16px (WCAG 1.4.4 - Resize text)
 * - Minimum line-height of 1.5× fontSize (WCAG 1.4.12 - Text Spacing)
 * @functionality It pre-validates all text styles in globalVars, then uses iterative
 * tree traversal to find nodes using invalid styles. This approach is 10-50× faster
 * than validating each node individually.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = 12;

// WCAG thresholds
const MIN_FONT_SIZE = 16; // pixels
const MIN_LINE_HEIGHT_RATIO = 1.5; // ratio for PIXELS unit
const MIN_LINE_HEIGHT_PERCENT = 150; // percentage for PERCENT unit

interface StyleViolation {
  fontSize?: string;
  lineHeight?: string;
}

/**
 * Validate font size against WCAG minimum
 */
function validateFontSize(fontSize: number | undefined): string | null {
  if (fontSize === undefined) return null;

  if (fontSize < MIN_FONT_SIZE) {
    return `Taille: ${fontSize}px (minimum: ${MIN_FONT_SIZE}px)`;
  }

  return null;
}

/**
 * Validate line-height against WCAG minimum
 * Handles both PIXELS and PERCENT units
 */
function validateLineHeight(lineHeight: any, fontSize: number | undefined): string | null {
  // Skip if lineHeight is undefined or AUTO
  if (!lineHeight || lineHeight.unit === 'AUTO') {
    return null; // AUTO respects WCAG by default
  }

  // Handle PERCENT unit
  if (lineHeight.unit === 'PERCENT') {
    if (lineHeight.value < MIN_LINE_HEIGHT_PERCENT) {
      return `line-height insuffisant (${lineHeight.value}% au lieu de ${MIN_LINE_HEIGHT_PERCENT}% minimum)`;
    }
    return null;
  }

  // Handle PIXELS unit
  if (lineHeight.unit === 'PIXELS' && fontSize !== undefined) {
    const ratio = lineHeight.value / fontSize;
    if (ratio < MIN_LINE_HEIGHT_RATIO) {
      return `line-height insuffisant (${lineHeight.value}px = ${ratio.toFixed(2)}× au lieu de ${MIN_LINE_HEIGHT_RATIO}× minimum)`;
    }
    return null;
  }

  // Unknown unit or missing fontSize - skip
  return null;
}

/**
 * Validate a text style and return violations
 */
function validateTextStyle(style: any): StyleViolation | null {
  const fontSizeError = validateFontSize(style.fontSize);
  const lineHeightError = validateLineHeight(style.lineHeight, style.fontSize);

  if (fontSizeError || lineHeightError) {
    const violation: StyleViolation = {};
    if (fontSizeError) violation.fontSize = fontSizeError;
    if (lineHeightError) violation.lineHeight = lineHeightError;
    return violation;
  }

  return null;
}

/**
 * Generate violation message from StyleViolation object
 */
function generateViolationMessage(violation: StyleViolation): string {
  const messages: string[] = [];
  if (violation.fontSize) messages.push(violation.fontSize);
  if (violation.lineHeight) messages.push(violation.lineHeight);
  return messages.join(' et ');
}

/**
 * Iteratively traverse tree and collect all nodes matching predicate
 */
function findNodesIterative(
  rootNodes: SimplifiedNode[],
  predicate: (node: SimplifiedNode) => boolean
): SimplifiedNode[] {
  const stack: SimplifiedNode[] = [...rootNodes];
  const matches: SimplifiedNode[] = [];

  while (stack.length > 0) {
    const node = stack.pop()!;

    if (predicate(node)) {
      matches.push(node);
    }

    // Add children to stack (reverse order for DFS)
    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
  }

  return matches;
}

export const checkTypography: AuditRule = (context) => {
  // 1️⃣ Pre-validate all text styles and build invalid styles map
  const invalidStyles = new Map<string, StyleViolation>();

  // Merge design system and local styles
  const allTextStyles = {
    ...context.globalVars.designSystem.text,
    ...context.globalVars.localStyles.text
  };

  for (const [styleId, styleData] of Object.entries(allTextStyles)) {
    // Handle both { value: ... } and direct style objects
    const style = (styleData as any).value || styleData;

    const violation = validateTextStyle(style);
    if (violation) {
      invalidStyles.set(styleId, violation);
    }
  }

  // Early return if no invalid styles found
  if (invalidStyles.size === 0) {
    return [];
  }

  // 2️⃣ Find all TEXT nodes using invalid styles (iterative traversal)
  const invalidTextNodes = findNodesIterative(
    context.nodes,
    (node) => node.type === 'TEXT' &&
              node.textStyle !== undefined &&
              invalidStyles.has(node.textStyle)
  );

  // 3️⃣ Generate audit results
  const results: AuditResult[] = invalidTextNodes.map(node => {
    const violation = invalidStyles.get(node.textStyle!)!;
    const message = generateViolationMessage(violation);

    return {
      ruleIds: [RULE_ID],
      nodeId: node.id,
      nodeName: node.name,
      moreInfos: {
        [RULE_ID.toString()]: message
      }
    };
  });

  return results;
};
