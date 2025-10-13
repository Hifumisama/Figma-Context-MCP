/**
 * @file Pattern Detector using AI
 * @description This module uses AI to analyze Figma design structures and detect repeated patterns
 * that could be converted into reusable components. Unlike the previous algorithmic approach,
 * this leverages LLM capabilities to understand visual and functional patterns in a more sophisticated way.
 */

import type { FigmaContext } from "../../get-figma-context/types.js";
import type { ComponentSuggestion } from "../types.js";
import type { SimplifiedNode } from "../../../../extractors/types.js";
import { LLMService } from "../../../../services/llm-service.js";
import { Logger } from "../../../../utils/logger.js";

interface AIPatternResponse {
  suggestions: {
    componentName: string;
    description: string;
    rootNodeId: string;
    rootNodeName: string;
  }[];
}

interface PatternDetectionResult {
  suggestions: ComponentSuggestion[];
}

/**
 * Recursively reconstructs the full tree of a node and its children
 */
function reconstructNodeTree(rootNodeId: string, allNodes: SimplifiedNode[]): { name: string; nodeId: string }[] {
  const nodeMap = new Map<string, SimplifiedNode>();

  // Create a flat map of all nodes for quick lookup
  function mapNodes(nodes: SimplifiedNode[]) {
    for (const node of nodes) {
      nodeMap.set(node.id, node);
      if (node.children) {
        mapNodes(node.children);
      }
    }
  }
  mapNodes(allNodes);

  // Recursively collect node and all its children
  function collectNodeAndChildren(nodeId: string): { name: string; nodeId: string }[] {
    const node = nodeMap.get(nodeId);
    if (!node) return [];

    const result = [{ name: node.name, nodeId: node.id }];

    if (node.children) {
      for (const child of node.children) {
        result.push(...collectNodeAndChildren(child.id));
      }
    }

    return result;
  }

  return collectNodeAndChildren(rootNodeId);
}

type GroupedSuggestion = AIPatternResponse['suggestions'][0] & {
  possibleInstances: { name: string; nodeId: string }[];
};

/**
 * Groups suggestions by componentName and creates a single suggestion with all possible instances
 */
function groupSuggestionsByName(aiSuggestions: AIPatternResponse['suggestions']): GroupedSuggestion[] {
  const groupedMap = new Map<string, AIPatternResponse['suggestions'][number][]>();

  // Group suggestions by componentName
  for (const suggestion of aiSuggestions) {
    const existing = groupedMap.get(suggestion.componentName);

    if (existing) {
      existing.push(suggestion);
    } else {
      groupedMap.set(suggestion.componentName, [suggestion]);
    }
  }

  // For each group, create a single suggestion with all instances
  const result: GroupedSuggestion[] = [];

  for (const [componentName, suggestions] of groupedMap.entries()) {
    // Use the first suggestion as the main example
    const firstSuggestion = suggestions[0];

    // Create a combined suggestion with all instances
    const combinedSuggestion = {
      componentName: firstSuggestion.componentName,
      description: firstSuggestion.description,
      rootNodeId: firstSuggestion.rootNodeId, // Use the first suggestion as the main example
      rootNodeName: firstSuggestion.rootNodeName,
      possibleInstances: suggestions.map(s => ({
        name: s.rootNodeName,
        nodeId: s.rootNodeId
      }))
    };

    result.push(combinedSuggestion);
  }

  // Sort by number of instances (descending), then alphabetically
  return result.sort((a, b) => {
    const instanceDiff = b.possibleInstances.length - a.possibleInstances.length;
    return instanceDiff !== 0 ? instanceDiff : a.componentName.localeCompare(b.componentName);
  });
}

/**
 * Traverses the design tree to collect all non-component nodes for pattern analysis
 * Excludes existing components but keeps them in the tree for context
 */
function collectNonComponentNodes(nodes: SimplifiedNode[]): SimplifiedNode[] {
  const candidateNodes: SimplifiedNode[] = [];

  function traverse(nodes: SimplifiedNode[]) {
    for (const node of nodes) {
      // Skip existing components and their children to avoid analyzing them
      if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'INSTANCE') {
        continue;
      }

      // We want container-like nodes that have children and could potentially be components
      if (node.children && node.children.length > 0) {
        candidateNodes.push(node);
      }

      // Continue traversing children
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return candidateNodes;
}

/**
 * Generates a comprehensive prompt for AI pattern detection
 */
function generatePatternDetectionPrompt(nodes: SimplifiedNode[], globalVars: any): string {
  // Prepare a clean, structured representation of the design for the AI
  const cleanNodes = nodes.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
    text: node.text,
    children: node.children ? node.children.map(child => ({
      id: child.id,
      name: child.name,
      type: child.type,
      text: child.text
    })) : undefined,
    visible: node.visible !== false,
    layout: node.layout,
    textStyle: node.textStyle,
    fills: node.fills,
    strokes: node.strokes
  }));

  return `Tu es un expert en design systems et en analyse de maquettes Figma.
Ton rôle est d'analyser une structure de design et d'identifier des patterns répétitifs qui pourraient être transformés en composants réutilisables.

RÈGLES IMPORTANTES :
1. Ignore complètement les nodes de type COMPONENT, COMPONENT_SET et INSTANCE (ils sont déjà des composants)
2. Concentre-toi sur les éléments qui se répètent structurellement ou visuellement
3. Un pattern doit apparaître au moins 2 fois pour être considéré
4. Pour chaque pattern détecté, tu peux proposer PLUSIEURS suggestions avec des noms spécifiques
5. Retourne seulement l'ID et le nom de la node RACINE de chaque pattern
6. DESCRIPTIONS EN FRANÇAIS OBLIGATOIRE

DONNÉES À ANALYSER :
${JSON.stringify(cleanNodes, null, 2)}

CONTEXTE GLOBAL (styles, variables) :
${JSON.stringify(globalVars, null, 2)}

CONSIGNES POUR L'ANALYSE :
- Identifie les patterns basés sur la structure des children, les types d'éléments, le contenu textuel
- Regarde les similitudes dans les combinaisons d'éléments (ex: icône + texte, image + titre + description)
- Considère les patterns fonctionnels (formulaires, cartes, boutons, navigation, etc.)
- Propose des noms de composants en camelCase qui reflètent la fonction précise (ex: userCard, productTile, navButton, searchBar)
- Écris des descriptions courtes mais informatives EN FRANÇAIS qui expliquent à quoi sert le composant

FORMAT DE RÉPONSE (JSON STRICT) :
{
  "suggestions": [
    {
      "componentName": "nomDuComposant",
      "description": "Description en français du composant",
      "rootNodeId": "id_de_la_node_racine",
      "rootNodeName": "nom de la node racine"
    }
  ]
}

Analyse maintenant ces nodes et retourne uniquement le JSON demandé, sans commentaire additionnel.`;
}

/**
 * Detects patterns using AI analysis
 */
export async function detectComponentPatterns(context: FigmaContext): Promise<ComponentSuggestion[]> {
  try {
    // Skip if AI rules are not enabled or no LLM configuration
    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      Logger.log('Component pattern detection skipped: No GOOGLE_CLOUD_PROJECT configured');
      return [];
    }

    // Collect candidate nodes (excluding existing components)
    const candidateNodes = collectNonComponentNodes(context.nodes);

    if (candidateNodes.length < 2) {
      Logger.log('Component pattern detection skipped: Not enough candidate nodes');
      return [];
    }

    // Initialize LLM service
    const llmService = LLMService.fromEnvironment();

    // Generate prompt and call AI
    const prompt = generatePatternDetectionPrompt(candidateNodes, context.globalVars);
    const response = await llmService.callLLM<AIPatternResponse>(prompt);

    if (!response.success || !response.data) {
      Logger.error('Pattern detection failed:', response.error || 'No data returned');
      return [];
    }

    const aiSuggestions = response.data.suggestions || [];
    Logger.log(`AI returned ${aiSuggestions.length} raw suggestions`);

    // Group suggestions by componentName and combine instances
    const groupedSuggestions = groupSuggestionsByName(aiSuggestions);
    Logger.log(`After grouping by name: ${groupedSuggestions.length} unique components`);

    // Reconstruct full tree for each suggestion
    const finalSuggestions: ComponentSuggestion[] = groupedSuggestions.map(suggestion => {
      const usableNodes = reconstructNodeTree(suggestion.rootNodeId, context.nodes);

      return {
        componentName: suggestion.componentName,
        description: suggestion.description,
        rootNodeId: suggestion.rootNodeId,
        rootNodeName: suggestion.rootNodeName,
        possibleInstances: suggestion.possibleInstances,
        usableNodes
      };
    });

    Logger.log(`Pattern detection completed: ${finalSuggestions.length} final suggestions`);
    return finalSuggestions;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    Logger.error('Error in pattern detection:', message);
    return [];
  }
}
