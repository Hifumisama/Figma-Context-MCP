/**
 * @file Get Figma Context Tool
 * @description This tool is responsible for fetching and simplifying data from a Figma URL.
 * It parses the URL to identify the file key and an optional node ID, then uses the FigmaService
 * to retrieve the raw data. The data is then processed by a series of extractors to create
 * a simplified, serializable representation of the design, which is returned as a JSON string.
 * This simplified context is the primary input for the audit tool.
 */
import { FigmaService } from "../../../services/figma.js";
import { simplifyRawFigmaObject, allExtractors } from "../../../extractors/index.js";
import { GetFigmaContextParamsSchema } from "./types.js";
import type { GetFigmaContextParams } from "./types.js";
import type { GetFileResponse, GetFileNodesResponse } from "@figma/rest-api-spec";
import { Logger } from "../../../utils/logger.js";
import { URL } from "url";

// --- Parameters ---
const parameters = GetFigmaContextParamsSchema.shape;

// --- Helper Functions ---
function parseFigmaUrl(url: string): FigmaUrlParts | null {
    try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/');
        const fileKeyIndex = pathParts.findIndex(part => part === 'file' || part === 'design');
        
        if (fileKeyIndex === -1 || fileKeyIndex + 1 >= pathParts.length) {
            return null;
        }
        
        const fileKey = pathParts[fileKeyIndex + 1];
        const nodeId = parsedUrl.searchParams.get('node-id') ?? undefined;
        
        return { fileKey, nodeId };
    } catch (error) {
        return null;
    }
}

interface FigmaUrlParts {
    fileKey: string;
    nodeId?: string;
}

// --- Handler ---
async function getFigmaContextHandler(params: GetFigmaContextParams, figmaService: FigmaService) {
    try {
        const urlParts = parseFigmaUrl(params.url);
        if (!urlParts) {
            throw new Error("Invalid Figma URL provided.");
        }

        const { fileKey, nodeId: urlNodeId } = urlParts;
        let targetNodeId = params.nodeId ?? urlNodeId;
        const scope = params.scope ?? 'auto';

        if (scope === 'file') {
            targetNodeId = undefined;
        } else if ((scope === 'node' || scope === 'auto') && !targetNodeId) {
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
