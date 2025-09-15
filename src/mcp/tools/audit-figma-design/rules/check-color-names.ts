/**
 * @file Color Naming Rule (AI-based)
 * @description This rule checks if color styles in the Figma file use semantic naming conventions
 * instead of literal names (e.g., "primary-500" vs. "blue").
 * @functionality It extracts all color style names from the Figma context and uses an LLM
 * to analyze them, providing suggestions for literal names that should be made more semantic.
 */
import type { AuditRule, AuditResult } from "../types.js";
import { LLMService } from "../../../../services/llm-service.js";
import { Logger } from "../../../../utils/logger.js";

const RULE_ID = 9;

interface ColorNameAnalysis {
  literal_name: string;
  semantic_suggestion: string;
}

function generateColorNamePrompt(colorNames: string[]): string {
  Logger.log(colorNames.map(name => `- ${name}`).join('\n'), 'colorNames');
    return `As an expert in Design Systems, analyze the following list of color style names from a Figma file.

Identify which names are "literal" (e.g., "Blue", "light-grey", "red-500", "#FF0000") and which are "semantic" (e.g., "primary-500", "text-color-danger", "surface-elevated").

Literal names are a bad practice because they describe the color's appearance rather than its purpose or role in the design system.

For each literal name you identify, provide a semantic suggestion that describes the color's purpose or role.

Respond in JSON format with an array of objects, where each object has the keys "literal_name" and "semantic_suggestion".

If all names are already semantic, return an empty array [].

Color names to analyze:
${colorNames.map(name => `- ${name}`).join('\n')}`;
}

export const checkColorNames: AuditRule = (context) => {

  const colorStyles = context.globalVars.designSystem.colors || {};
  const colorNames = Object.values(colorStyles).map(color => color.name).filter(name => name !== 'none');

  Logger.log(`📊 Found ${colorNames.length} color styles:`, colorNames);

  if (colorNames.length === 0) {
    Logger.log('⚠️ No color styles found, returning empty');
    return [];
  }

  // Check if LLM is available and enabled
  const enableAIRules = process.env.ENABLE_AI_RULES === 'true' || process.env.NODE_ENV === 'development';
  Logger.log(`🤖 AI Rules enabled: ${enableAIRules}`);
  
  if (!enableAIRules) {
    Logger.log('AI rules disabled, skipping color naming analysis');
    return [];
  }

  try {
    const llmService = LLMService.fromEnvironment();
    const prompt = generateColorNamePrompt(colorNames);
    // Make the LLM call (this is async but AuditRule is sync - we'll return a placeholder)
    // In a real implementation, you might want to make AuditRule async or handle this differently
    llmService.callLLM<ColorNameAnalysis[]>(prompt).then(response => {
      if (response.success && response.data) {
        console.log(response.data);
        Logger.log(`LLM analysis completed: found ${response.data.length} literal color names`);
      } else {
        Logger.log(`LLM analysis failed: ${response.error}`);
      }
    }).catch(error => {
      Logger.log(`LLM analysis error: ${error}`);
    });

    // For now, return a pending status until we can make this properly async
    return [{
      ruleIds: [RULE_ID],
      nodeId: "DOCUMENT", 
      nodeName: "Color Styles",
      moreInfos: { [RULE_ID.toString()]: `Analyse en cours de ${colorNames.length} noms de couleurs: ${colorNames.slice(0, 3).join(', ')}${colorNames.length > 3 ? '...' : ''}` }
    }];

  } catch (error) {
    Logger.log(`Color naming rule failed: ${error}`);
    
    return [{
      ruleIds: [RULE_ID],
      nodeId: "DOCUMENT",
      nodeName: "Color Styles", 
      moreInfos: { [RULE_ID.toString()]: `Erreur lors de l'analyse: ${error instanceof Error ? error.message : 'Erreur inconnue'}` }
    }];
  }
};
