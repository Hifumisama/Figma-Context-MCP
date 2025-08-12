/**
 * @file Types for Get Figma Context Tool
 * @description This file defines the TypeScript types and Zod schemas for the parameters
 * and return value of the `get_figma_context` tool. It ensures that the inputs are correctly
 * validated and that the output, `FigmaContext`, conforms to the `SimplifiedDesign` structure.
 */
import { z } from "zod";
import type { SimplifiedDesign } from "../../../extractors/types.js";

export const GetFigmaContextParamsSchema = z.object({
  url: z.string().url().describe("The Figma URL for a project, page, or frame."),
  scope: z.enum(["auto", "file", "page", "node"]).optional().default("auto").describe("The scope of the analysis. Defaults to 'auto' detection based on the URL."),
});

export type GetFigmaContextParams = z.infer<typeof GetFigmaContextParamsSchema>;

export type FigmaContext = SimplifiedDesign;
