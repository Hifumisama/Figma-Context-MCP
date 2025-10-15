/**
 * Mock for FigmaService
 * Used in tests to avoid real API calls
 */
import type { GetFileResponse, GetFileNodesResponse } from "@figma/rest-api-spec";
import { vi } from "vitest";

export const createMockFigmaService = () => {
  return {
    getRawFile: vi.fn<(fileKey: string, depth?: number | null) => Promise<GetFileResponse>>(),
    getRawNode: vi.fn<(fileKey: string, nodeId: string, depth?: number | null) => Promise<GetFileNodesResponse>>(),
    getImageFillUrls: vi.fn(),
    getNodeRenderUrls: vi.fn(),
    downloadImages: vi.fn(),
  };
};

export type MockFigmaService = ReturnType<typeof createMockFigmaService>;
