/**
 * @file Color Naming Rule (AI-based)
 * @description This rule checks if color styles in the Figma file use semantic naming conventions
 * instead of literal names (e.g., "primary-500" vs. "blue").
 * @functionality It extracts all color style names from the Figma context and uses an LLM
 * to analyze them, providing suggestions for literal names that should be made more semantic.
 */
import type { AsyncAuditRule, AuditResult } from "../types.js";
import { LLMService } from "../../../../services/llm-service.js";
import { Logger } from "../../../../utils/logger.js";

const RULE_ID = 9;

interface ColorNameAnalysis {
  literal_name: string;
  semantic_suggestion: string;
}

function generateColorNamePrompt(colorNames: string[]): string {
    return `As an expert in Design Systems, analyze the following list of color style names from a Figma file.

Identify which names are "literal" (e.g., "Blue", "light-grey", "red-500", "#FF0000") and which are "semantic" (e.g., "primary-500", "text-color-danger", "surface-elevated", "background-color").

IMPORTANT: 
- Literal names describe the color's appearance (what it looks like)
- Semantic names describe the color's purpose or role (what it's used for)
- ONLY include colors that are clearly literal in your response
- IGNORE colors that are already semantic, even if they could be improved

For each literal name you identify, provide a semantic suggestion that describes the color's purpose or role.

Respond in JSON format with an array of objects, where each object has the keys "literal_name" and "semantic_suggestion".

If no literal names are found (all names are already semantic), return an empty array [].

Examples of semantic names to IGNORE: "primary", "secondary", "accent", "background", "surface", "text-primary", "border-color", "success", "warning", "error", etc.

Color names to analyze:
${colorNames.map(name => `- ${name}`).join('\n')}`;
}

export const checkColorNames: AsyncAuditRule = async (context) => {
  const colorStyles = context.globalVars.designSystem.colors || {};
  // Créer un map pour associer les noms de couleurs à leurs IDs
  const colorNameToId = new Map<string, string>();
  for (const [colorId, colorData] of Object.entries(colorStyles)) {
    if (colorData.name && colorData.name !== 'none') {
      colorNameToId.set(colorData.name, colorId);
    }
  }
  
  const colorNames = Array.from(colorNameToId.keys());

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
    
    // Maintenant on peut attendre la réponse de l'IA !
    const response = await llmService.callLLM<ColorNameAnalysis[]>(prompt);
    
    if (response.success && response.data) {
      // Créer un résultat pour chaque nom de couleur problématique
      const results: AuditResult[] = response.data.map(analysis => {
        const colorId = colorNameToId.get(analysis.literal_name) || "DOCUMENT";
        return {
          ruleIds: [RULE_ID],
          nodeId: colorId,
          nodeName: `Style couleur "${analysis.literal_name}"`,
          moreInfos: { 
            [RULE_ID.toString()]: `Nom littéral détecté: "${analysis.literal_name}". Suggestion sémantique: "${analysis.semantic_suggestion}"` 
          }
        };
      });
      
      return results;
    } else {
      Logger.log(`LLM analysis failed: ${response.error}`);
      return [{
        ruleIds: [RULE_ID],
        nodeId: "DOCUMENT",
        nodeName: "Color Styles",
        moreInfos: { [RULE_ID.toString()]: `Erreur lors de l'analyse: ${response.error || 'Erreur inconnue'}` }
      }];
    }

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
