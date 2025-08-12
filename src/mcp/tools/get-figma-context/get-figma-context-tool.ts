import { z } from "zod";
import { FigmaService } from "../../../services/figma.js";
import { simplifyRawFigmaObject, allExtractors } from "../../../extractors/index.js";
import { GetFigmaContextParamsSchema } from "./types.js";
import type { GetFigmaContextParams } from "./types.js";
import type { GetFileResponse, GetFileNodesResponse } from "@figma/rest-api-spec";
import { Logger } from "../../../utils/logger.js";

// --- Parameters ---
const parameters = GetFigmaContextParamsSchema.shape;

// --- Helper Functions ---
const figmaUrlRegex = /figma\.com\/(file|design)\/([a-zA-Z0-9]+)\/.*?(\?.*node-id=([0-9%A-Z-]+))?/;

interface FigmaUrlParts {
    fileKey: string;
    nodeId?: string;
}

function parseFigmaUrl(url: string): FigmaUrlParts | null {
    const matches = url.match(figmaUrlRegex);
    if (!matches) return null;
    const fileKey = matches[2];
    const nodeId = matches[4] ? decodeURIComponent(matches[4]) : undefined;
    return { fileKey, nodeId };
}

// --- Handler ---
async function getFigmaContextHandler(params: GetFigmaContextParams, figmaService: FigmaService) {
    try {
        const urlParts = parseFigmaUrl(params.url);
        if (!urlParts) {
            throw new Error("Invalid Figma URL provided.");
        }

        const { fileKey, nodeId: urlNodeId } = urlParts;
        let targetNodeId: string | undefined;
        const scope = params.scope ?? 'auto';

        if (scope === 'file') {
            targetNodeId = undefined;
        } else if (scope === 'node' || scope === 'auto') {
            targetNodeId = urlNodeId;
        }

        let rawApiResponse: GetFileResponse | GetFileNodesResponse;
        if (targetNodeId) {
            rawApiResponse = await figmaService.getRawNode(fileKey, targetNodeId);
        } else {
            rawApiResponse = await figmaService.getRawFile(fileKey);
        }

        const simplifiedDesign = simplifyRawFigmaObject(rawApiResponse, allExtractors, {});

        return {
            content: [{ type: "text" as const, text: JSON.stringify(simplifiedDesign, null, 2) }],
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Logger.error(`Error in get_figma_context for URL ${params.url}:`, message);
        return {
            isError: true,
            content: [{ type: "text" as const, text: `Error fetching Figma context: ${message}` }],
        };
    }
}

// --- Tool Definition ---
export const getFigmaContextTool = {
    name: "get_figma_context",
    description: "Fetches and simplifies Figma data from a URL, scoping to the file, page, or a specific node.",
    parameters,
    handler: getFigmaContextHandler,
} as const;
