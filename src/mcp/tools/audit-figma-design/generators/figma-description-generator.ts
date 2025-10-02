/**
 * @file Figma Description Generator
 * @description Service for generating AI-powered descriptions of Figma design files
 * Uses LLM to analyze design structure and provide contextual summaries
 */

import { LLMService } from "~/services/llm-service.js";
import type { FigmaContext } from "../../get-figma-context/types.js";
import { Logger } from "~/utils/logger.js";

export interface FigmaDescriptionResult {
  success: boolean;
  description?: string;
  error?: string;
}

export class FigmaDescriptionGenerator {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
  }

  /**
   * Generates an AI-powered description of a Figma design
   * @param context The simplified Figma design context
   * @returns Promise with the generated description or error
   */
  async generateDescription(context: FigmaContext): Promise<FigmaDescriptionResult> {
    try {
      Logger.log('Generating Figma design description with AI...');

      const prompt = this.buildPrompt(context);
      const response = await this.llmService.callLLM<{ description: string }>(prompt);

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'Échec de la génération de description par l\'IA'
        };
      }

      return {
        success: true,
        description: response.data.description
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      Logger.log(`Erreur lors de la génération de description: ${errorMessage}`);

      return {
        success: false,
        error: `Erreur lors de la génération de description: ${errorMessage}`
      };
    }
  }

  /**
   * Builds the AI prompt for description generation
   * @param context The Figma design context
   * @returns The formatted prompt string
   */
  private buildPrompt(context: FigmaContext): string {
    // Analyze the design structure
    const analysis = this.analyzeDesignStructure(context);

    return `Tu es un expert en analyse de design UX/UI. Analyse cette maquette Figma et génère une description concise et pertinente.

**Fichier Figma :** ${context.name}

**Structure de la maquette :**
- Nombre total d'éléments : ${analysis.totalNodes}
- Types d'éléments principaux : ${analysis.mainNodeTypes.join(', ')}
- Composants détectés : ${analysis.componentCount}
- Textes principaux : ${analysis.mainTexts.slice(0, 5).join(', ')}${analysis.mainTexts.length > 5 ? '...' : ''}

**Design System :**
- Couleurs : ${analysis.colorCount} couleurs définies
- Styles de texte : ${analysis.textStyleCount} styles
- Images : ${analysis.imageCount} images

**Instructions :**
1. Identifie le type de projet (app mobile, site web, interface admin, etc.)
2. Décris les composants/sections principales de la maquette
3. Mentionne les éléments de design notables (couleurs, typographie, layout)
4. Reste concis (maximum 200 mots)
5. Écris en français, ton professionnel mais accessible

**Format de réponse :**
Renvoie uniquement un objet JSON avec cette structure :
{
  "description": "Ta description en markdown ici..."
}

La description doit être en markdown et peut inclure des **gras** et *italiques* pour mettre en valeur les éléments importants.`;
  }

  /**
   * Analyzes the design structure to extract key information
   * @param context The Figma design context
   * @returns Analysis summary
   */
  private analyzeDesignStructure(context: FigmaContext) {
    const analysis = {
      totalNodes: 0,
      mainNodeTypes: [] as string[],
      componentCount: Object.keys(context.components || {}).length,
      mainTexts: [] as string[],
      colorCount: Object.keys(context.globalVars?.designSystem?.colors || {}).length,
      textStyleCount: Object.keys(context.globalVars?.designSystem?.text || {}).length,
      imageCount: Object.keys(context.globalVars?.images || {}).length
    };

    const nodeTypeCounts: Record<string, number> = {};

    const traverseNodes = (nodes: any[]) => {
      for (const node of nodes) {
        analysis.totalNodes++;

        // Count node types
        nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] || 0) + 1;

        // Collect meaningful text content
        if (node.text && typeof node.text === 'string' && node.text.length > 3) {
          analysis.mainTexts.push(node.text);
        }

        // Traverse children
        if (node.children && Array.isArray(node.children)) {
          traverseNodes(node.children);
        }
      }
    };

    if (context.nodes && Array.isArray(context.nodes)) {
      traverseNodes(context.nodes);
    }

    // Get the most common node types
    analysis.mainNodeTypes = Object.entries(nodeTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    return analysis;
  }

  /**
   * Generates a fallback description when AI is disabled
   * @param context The Figma design context
   * @returns A basic description
   */
  static generateFallbackDescription(context: FigmaContext): string {
    return `**${context.name}**

Ceci est une maquette analysée par notre outil FigmaAnalyse. Cette interface contient ${Object.keys(context.components || {}).length} composants et utilise ${Object.keys(context.globalVars?.designSystem?.colors || {}).length} couleurs définies dans le design system.`;
  }
}