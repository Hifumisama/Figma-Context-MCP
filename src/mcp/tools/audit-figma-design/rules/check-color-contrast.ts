/**
 * @file Color Contrast Rule (WCAG Compliance)
 * @description This rule checks if text and background color combinations meet WCAG contrast
 * requirements for accessibility. It analyzes both AA (4.5:1 normal, 3:1 large) and AAA
 * (7:1 normal, 4.5:1 large) compliance levels.
 * @functionality It recursively traverses text nodes, finds their background colors by climbing
 * the parent hierarchy, calculates contrast ratios using WCAG formulas, and reports violations
 * with detailed information including color names and hex values.
 */
import type { AuditRule, AuditResult } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";

const RULE_ID = 11;

// WCAG contrast thresholds
const WCAG_THRESHOLDS = {
  AA: {
    normal: 4.5,
    large: 3.0
  },
  AAA: {
    normal: 7.0,
    large: 4.5
  }
};

// Large text thresholds according to WCAG (18pt/24px or 14pt/18.67px bold)
const LARGE_TEXT_THRESHOLDS = {
  fontSize: 24, // 18pt = ~24px
  fontSizeBold: 18.67 // 14pt = ~18.67px when bold (600+ weight)
};

interface ColorInfo {
  name: string;
  hex: string;
  source: 'designSystem' | 'localStyles';
}

interface ContrastAnalysis {
  textColor: ColorInfo;
  backgroundColor: ColorInfo;
  ratio: number;
  isLargeText: boolean;
  wcagAA: {
    required: number;
    passes: boolean;
  };
  wcagAAA: {
    required: number;
    passes: boolean;
  };
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  const match = cleanHex.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;

  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  };
}

/**
 * Calculate relative luminance according to WCAG guidelines
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  // Convert to sRGB values
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1Hex: string, color2Hex: string): number {
  const rgb1 = hexToRgb(color1Hex);
  const rgb2 = hexToRgb(color2Hex);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get color information from design system or local styles
 */
function getColorInfo(colorId: string, globalVars: any): ColorInfo | null {
  // Check design system colors first
  const designSystemColor = globalVars.designSystem?.colors?.[colorId];
  if (designSystemColor) {
    return {
      name: designSystemColor.name || colorId,
      hex: designSystemColor.hexValue || '#000000',
      source: 'designSystem'
    };
  }

  // Check local styles colors
  const localColor = globalVars.localStyles?.colors?.[colorId];
  if (localColor) {
    return {
      name: localColor.name || colorId,
      hex: localColor.hexValue || '#000000',
      source: 'localStyles'
    };
  }

  return null;
}

/**
 * Determine if text is considered "large" according to WCAG
 */
function isLargeText(textStyle: any): boolean {
  if (!textStyle) return false;

  const fontSize = textStyle.fontSize || 0;
  const fontWeight = textStyle.fontWeight || 400;

  // 18pt (24px) or larger is always large text
  if (fontSize >= LARGE_TEXT_THRESHOLDS.fontSize) {
    return true;
  }

  // 14pt (18.67px) or larger with bold weight (600+)
  if (fontSize >= LARGE_TEXT_THRESHOLDS.fontSizeBold && fontWeight >= 600) {
    return true;
  }

  return false;
}

/**
 * Get text style information from design system or local styles
 */
function getTextStyle(textStyleId: string, globalVars: any): any {
  // Check design system text styles first
  const designSystemTextStyle = globalVars.designSystem?.text?.[textStyleId];
  if (designSystemTextStyle?.value) {
    return designSystemTextStyle.value;
  }

  // Check local styles text
  const localTextStyle = globalVars.localStyles?.text?.[textStyleId];
  if (localTextStyle) {
    return localTextStyle;
  }

  return null;
}

/**
 * Find background color by climbing up the parent hierarchy
 */
function findBackgroundColor(node: SimplifiedNode, allNodes: SimplifiedNode[], globalVars: any): ColorInfo | null {
  // First, try to find the parent node
  const findParent = (nodeId: string): SimplifiedNode | null => {
    const findInNode = (searchNode: SimplifiedNode): SimplifiedNode | null => {
      if (searchNode.children) {
        for (const child of searchNode.children) {
          if (child.id === nodeId) {
            return searchNode;
          }
          const found = findInNode(child);
          if (found) return found;
        }
      }
      return null;
    };

    for (const rootNode of allNodes) {
      const parent = findInNode(rootNode);
      if (parent) return parent;
    }
    return null;
  };

  let currentNode: SimplifiedNode | null = node;

  // Climb up the hierarchy looking for a fill
  while (currentNode) {
    const parent = findParent(currentNode.id);
    if (!parent) break;

    // Check if parent has a fill (background color)
    if (parent.fills && typeof parent.fills === 'string') {
      const colorInfo = getColorInfo(parent.fills, globalVars);
      if (colorInfo) {
        return colorInfo;
      }
    }

    currentNode = parent;
  }

  // If no background found, assume white background
  return {
    name: 'Default Background',
    hex: '#FFFFFF',
    source: 'localStyles'
  };
}

/**
 * Check if node type should be excluded (images, etc.)
 */
function shouldExcludeNode(node: SimplifiedNode): boolean {
  const excludedTypes = ['IMAGE-SVG', 'IMAGE', 'MASK'];
  return excludedTypes.includes(node.type);
}

/**
 * Analyze contrast for a text node
 */
function analyzeTextContrast(node: SimplifiedNode, allNodes: SimplifiedNode[], globalVars: any): ContrastAnalysis | null {
  // Skip non-text nodes
  if (node.type !== 'TEXT') return null;

  // Skip nodes without fills
  if (!node.fills || typeof node.fills !== 'string') return null;

  // Get text color
  const textColor = getColorInfo(node.fills, globalVars);
  if (!textColor) return null;

  // Find background color
  const backgroundColor = findBackgroundColor(node, allNodes, globalVars);
  if (!backgroundColor) return null;

  // Get text style for size analysis
  const textStyle = node.textStyle ? getTextStyle(node.textStyle, globalVars) : null;
  const isLarge = isLargeText(textStyle);

  // Calculate contrast ratio
  const ratio = getContrastRatio(textColor.hex, backgroundColor.hex);

  // Determine WCAG requirements
  const aaRequired = isLarge ? WCAG_THRESHOLDS.AA.large : WCAG_THRESHOLDS.AA.normal;
  const aaaRequired = isLarge ? WCAG_THRESHOLDS.AAA.large : WCAG_THRESHOLDS.AAA.normal;

  return {
    textColor,
    backgroundColor,
    ratio,
    isLargeText: isLarge,
    wcagAA: {
      required: aaRequired,
      passes: ratio >= aaRequired
    },
    wcagAAA: {
      required: aaaRequired,
      passes: ratio >= aaaRequired
    }
  };
}

/**
 * Recursively check all nodes for contrast issues
 */
function checkNode(node: SimplifiedNode, allNodes: SimplifiedNode[], globalVars: any): AuditResult[] {
  let results: AuditResult[] = [];

  // Skip excluded node types
  if (shouldExcludeNode(node)) {
    // Still check children
    if (node.children) {
      for (const child of node.children) {
        results = results.concat(checkNode(child, allNodes, globalVars));
      }
    }
    return results;
  }

  // Analyze text contrast
  if (node.type === 'TEXT') {
    const analysis = analyzeTextContrast(node, allNodes, globalVars);

    if (analysis) {
      const issues: string[] = [];

      // Check WCAG AA compliance
      if (!analysis.wcagAA.passes) {
        issues.push(`WCAG AA: ${analysis.ratio.toFixed(2)}:1 (requis: ${analysis.wcagAA.required}:1)`);
      }

      // Check WCAG AAA compliance (only report if AA passes but AAA fails)
      if (analysis.wcagAA.passes && !analysis.wcagAAA.passes) {
        issues.push(`WCAG AAA: ${analysis.ratio.toFixed(2)}:1 (requis: ${analysis.wcagAAA.required}:1)`);
      }

      // Only create result if there are issues
      if (issues.length > 0) {
        const textSizeInfo = analysis.isLargeText ? ' (texte large)' : ' (texte normal)';
        const colorDetails = `${analysis.textColor.name} (${analysis.textColor.hex}) sur ${analysis.backgroundColor.name} (${analysis.backgroundColor.hex})${textSizeInfo}`;

        results.push({
          ruleIds: [RULE_ID],
          nodeId: node.id,
          nodeName: node.name,
          moreInfos: {
            [RULE_ID.toString()]: `Contraste insuffisant: ${colorDetails}. ${issues.join(', ')}`
          }
        });
      }
    }
  }

  // Recursively check children
  if (node.children) {
    for (const child of node.children) {
      results = results.concat(checkNode(child, allNodes, globalVars));
    }
  }

  return results;
}

export const checkColorContrast: AuditRule = (context) => {
  const allResults: AuditResult[] = [];
  for (const node of context.nodes) {
    allResults.push(...checkNode(node, context.nodes, context.globalVars));
  }
  return allResults;
};