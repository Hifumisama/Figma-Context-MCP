import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startServer } from "./cli.js";

// Mock dependencies
const { mockGetServerConfig, mockStartHttpServer, mockCreateServer, mockTransport } = vi.hoisted(
  () => ({
    mockGetServerConfig: vi.fn(),
    mockStartHttpServer: vi.fn(),
    mockCreateServer: vi.fn(),
    mockTransport: {
      connect: vi.fn(),
    },
  }),
);

vi.mock("./config.js", () => ({
  getServerConfig: mockGetServerConfig,
}));

vi.mock("./server.js", () => ({
  startHttpServer: mockStartHttpServer,
}));

vi.mock("./mcp/index.js", () => ({
  createServer: mockCreateServer,
}));

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => mockTransport),
}));

vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

describe("cli.ts - CLI entry point", () => {
  const originalEnv = process.env;
  const originalArgv = process.argv;
  const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.argv = [...originalArgv];

    const mockServer = { connect: vi.fn() };
    mockCreateServer.mockReturnValue(mockServer);
  });

  afterEach(() => {
    process.env = originalEnv;
    process.argv = originalArgv;
  });

  afterAll(() => {
    mockExit.mockRestore();
  });

  describe("Server mode detection", () => {
    it("should start in stdio mode when NODE_ENV=cli", async () => {
      process.env.NODE_ENV = "cli";
      mockGetServerConfig.mockReturnValue({
        auth: { figmaApiKey: "test-key", figmaOAuthToken: "", useOAuth: false },
        port: 3333,
        outputFormat: "yaml",
        skipImageDownloads: false,
      });

      const mockServer = { connect: vi.fn() };
      mockCreateServer.mockReturnValue(mockServer);

      await startServer();

      expect(mockGetServerConfig).toHaveBeenCalledWith(true);
      expect(mockCreateServer).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ isHTTP: false }),
      );
      expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
      expect(mockStartHttpServer).not.toHaveBeenCalled();
    });

    it("should start in stdio mode when --stdio flag present", async () => {
      process.argv = [...originalArgv, "--stdio"];
      mockGetServerConfig.mockReturnValue({
        auth: { figmaApiKey: "test-key", figmaOAuthToken: "", useOAuth: false },
        port: 3333,
        outputFormat: "yaml",
        skipImageDownloads: false,
      });

      await startServer();

      expect(mockGetServerConfig).toHaveBeenCalledWith(true);
      expect(mockCreateServer).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ isHTTP: false }),
      );
    });

    it("should start in HTTP mode by default", async () => {
      mockGetServerConfig.mockReturnValue({
        auth: { figmaApiKey: "test-key", figmaOAuthToken: "", useOAuth: false },
        port: 3333,
        outputFormat: "yaml",
        skipImageDownloads: false,
      });

      await startServer();

      expect(mockGetServerConfig).toHaveBeenCalledWith(false);
      expect(mockCreateServer).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ isHTTP: true }),
      );
      expect(mockStartHttpServer).toHaveBeenCalledWith(3333, expect.any(Object));
    });
  });

  describe("Server configuration", () => {
    it("should pass auth config to createServer", async () => {
      const authConfig = {
        figmaApiKey: "test-api-key",
        figmaOAuthToken: "test-oauth-token",
        useOAuth: true,
      };

      mockGetServerConfig.mockReturnValue({
        auth: authConfig,
        port: 4000,
        outputFormat: "json",
        skipImageDownloads: true,
      });

      await startServer();

      expect(mockCreateServer).toHaveBeenCalledWith(authConfig, expect.any(Object));
    });

    it("should pass server options to createServer", async () => {
      mockGetServerConfig.mockReturnValue({
        auth: { figmaApiKey: "test-key", figmaOAuthToken: "", useOAuth: false },
        port: 3333,
        outputFormat: "json",
        skipImageDownloads: true,
      });

      await startServer();

      expect(mockCreateServer).toHaveBeenCalledWith(expect.any(Object), {
        isHTTP: true,
        outputFormat: "json",
        skipImageDownloads: true,
      });
    });
  });

  describe("Error handling", () => {
    it("should propagate errors from server creation", async () => {
      mockGetServerConfig.mockReturnValue({
        auth: { figmaApiKey: "test-key", figmaOAuthToken: "", useOAuth: false },
        port: 3333,
        outputFormat: "yaml",
        skipImageDownloads: false,
      });

      mockCreateServer.mockImplementation(() => {
        throw new Error("Server creation failed");
      });

      await expect(startServer()).rejects.toThrow("Server creation failed");
    });

    it("should propagate errors from HTTP server start", async () => {
      mockGetServerConfig.mockReturnValue({
        auth: { figmaApiKey: "test-key", figmaOAuthToken: "", useOAuth: false },
        port: 3333,
        outputFormat: "yaml",
        skipImageDownloads: false,
      });

      mockStartHttpServer.mockRejectedValue(new Error("Port already in use"));

      await expect(startServer()).rejects.toThrow("Port already in use");
    });
  });
});
