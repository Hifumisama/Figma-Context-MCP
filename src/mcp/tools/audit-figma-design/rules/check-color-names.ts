/**
 * @file Color Naming Rule (AI-based)
 * @description This rule checks if color styles in the Figma file use semantic naming conventions
 * instead of literal names (e.g., "primary-500" vs. "blue").
 * @functionality It extracts all color style names from the Figma context and generates a
 * prompt for an AI model to analyze them. For now, it returns a placeholder result
 * containing the generated prompt, paving the way for future AI integration without
 * making a live API call.
 */
import type { AuditRule, AuditResult } from "../types.js";

const RULE_ID = 9;

function generateColorNamePrompt(colorNames: string[]): string {
    return `
As an expert in Design Systems, analyze the following list of color style names from a Figma file.
Identify which names are "literal" (e.g., "Blue", "light-grey") and which are "semantic" (e.g., "primary-500", "text-color-danger").
Literal names are a bad practice because they don't describe the color's purpose.

For each literal name, provide a semantic suggestion.

Respond in JSON format with an array of objects, where each object has the keys "literal_name" and "semantic_suggestion".

Color names to analyze:
${colorNames.map(name => `- ${name}`).join('\n')}
`;
}

export const checkColorNames: AuditRule = (context) => {
  const allStyleNames = Object.values(context.globalVars.styles)
    .map(styleDef => styleDef.name)
    .filter(name => !!name && name.toLowerCase().includes('color')); // Focus on color styles

  if (allStyleNames.length === 0) {
    return [];
  }
  
  // For now, instead of calling an LLM, we will return an audit result
  // containing the prompt that we would have sent. This is for debugging.
  const prompt = generateColorNamePrompt(allStyleNames);

  return [{
    ruleIds: [RULE_ID],
    nodeId: "DOCUMENT",
    nodeName: "Color Styles",
    moreInfos: `Styles à analyser: ${allStyleNames.join(', ')}`
  }];
};
