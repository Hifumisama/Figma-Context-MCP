import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import yaml from "js-yaml";
import type { GetFileResponse, GetFileNodesResponse } from "@figma/rest-api-spec";
import { FigmaService } from "../../services/figma.js";
import { simplifyRawFigmaObject, allExtractors } from "../../extractors/index.js";
import { Logger } from "../../utils/logger.js";

const parameters = {
  fileKey: z
    .string()
    .describe(
      "The key of the Figma file to evaluate, often found in a URL like figma.com/(file|design)/<fileKey>/...",
    ),
  nodeId: z
    .string()
    .optional()
    .describe("The ID of a specific node to evaluate within the file."),
  depth: z
    .number()
    .optional()
    .describe("Controls how many levels deep to traverse the node tree for the evaluation."),
};

const parametersSchema = z.object(parameters);
export type EvaluateDesignParams = z.infer<typeof parametersSchema>;

async function evaluateDesign(params: EvaluateDesignParams, figmaService: FigmaService) {
  try {
    const { fileKey, nodeId, depth } = params;
    Logger.log(`Starting intelligent prompt generation for file evaluation: ${fileKey}`);

    // --- Step 1: Fetch Figma Data ---
    let rawApiResponse: GetFileResponse | GetFileNodesResponse;
    if (nodeId) {
      rawApiResponse = await figmaService.getRawNode(fileKey, nodeId, depth);
    } else {
      rawApiResponse = await figmaService.getRawFile(fileKey, depth);
    }
    const simplifiedDesign = simplifyRawFigmaObject(rawApiResponse, allExtractors, { maxDepth: depth });
    const figmaDataYaml = yaml.dump(simplifiedDesign);

    // --- Step 2: Read Analysis Template ---
    // Note: The path is relative to the project root where the script is executed.
    // This might need adjustment based on the final execution context.
    const templatePath = path.resolve(process.cwd(), 'src/templates/figma-analysis-template.md');
    const analysisTemplate = await fs.readFile(templatePath, 'utf-8');

    // --- Step 3: Assemble the Final Prompt ---
    const finalPrompt = `
As an expert in UI/UX design and Design Systems, your task is to conduct a thorough analysis of a Figma design file.
Below, you are provided with a comprehensive analysis template and the full data structure of the Figma file in YAML format.

Your mission is to:
1.  Carefully review the Figma data.
2.  Use the provided template as the structure for your response.
3.  Fill in every section of the template with your detailed analysis, insights, and concrete recommendations based on the data.
4.  Be specific: refer to component names, styles, or node IDs where relevant.
5.  Provide a final score and a prioritized action plan.


---
**ANALYSIS TEMPLATE:**
---
${analysisTemplate}

---
**FIGMA FILE DATA (YAML):**
---
${figmaDataYaml}
`;

    Logger.log("Successfully generated the analysis prompt. Sending to the model.");

    return {
      content: [{ type: "text" as const, text: finalPrompt }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    Logger.error(`Error during intelligent prompt generation for file ${params.fileKey}:`, message);
    return {
      isError: true,
      content: [{ type: "text" as const, text: `Error during evaluation prompt generation: ${message}` }],
    };
  }
}

export const evaluateDesignTool = {
  name: "evaluate_design",
  description:
    "Performs a comprehensive quality evaluation of a Figma design by generating a detailed analysis prompt for an LLM.",
  parameters,
  handler: evaluateDesign,
} as const; 