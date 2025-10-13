/**
 * Fixture loader utilities
 * Loads test data from JSON files
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { FigmaContext } from "../mcp/tools/get-figma-context/types.js";
import type { GetFileResponse } from "@figma/rest-api-spec";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load sample Figma context data (simplified, ready for audit)
 */
export function loadSampleFigmaContext(): FigmaContext {
  const path = join(__dirname, "../mcp/tools/audit-figma-design/__fixtures__/sampleData.json");
  const data = readFileSync(path, "utf-8");
  return JSON.parse(data) as FigmaContext;
}

/**
 * Load raw Figma API response data
 */
export function loadRawFigmaData(): GetFileResponse {
  const path = join(__dirname, "../mcp/tools/get-figma-context/__fixtures__/rawData.json");
  const data = readFileSync(path, "utf-8");
  return JSON.parse(data) as GetFileResponse;
}
