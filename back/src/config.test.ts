import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getServerConfig } from "./config.js";

// Mock dependencies
const { mockLoadEnv, mockYargs } = vi.hoisted(() => ({
  mockLoadEnv: vi.fn(),
  mockYargs: vi.fn(),
}));

vi.mock("dotenv", () => ({
  config: mockLoadEnv,
}));

vi.mock("yargs", () => ({
  default: mockYargs,
}));

vi.mock("yargs/helpers", () => ({
  hideBin: vi.fn((argv) => argv),
}));

describe("config.ts - Configuration management", () => {
  const originalEnv = process.env;
  const originalArgv = process.argv;
  const originalExit = process.exit;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.argv = [...originalArgv];
    console.log = vi.fn();
    console.error = vi.fn();
    process.exit = vi.fn() as any;

    // Default yargs mock
    const yargsChain = {
      options: vi.fn().mockReturnThis(),
      help: vi.fn().mockReturnThis(),
      version: vi.fn().mockReturnThis(),
      parseSync: vi.fn().mockReturnValue({}),
    };
    mockYargs.mockReturnValue(yargsChain);
  });

  afterEach(() => {
    process.env = originalEnv;
    process.argv = originalArgv;
    process.exit = originalExit;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe("Authentication priority: CLI > ENV", () => {
    it("should use CLI figma-api-key over environment", () => {
      process.env.FIGMA_API_KEY = "env-key";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({ "figma-api-key": "cli-key" }),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.auth.figmaApiKey).toBe("cli-key");
      expect(config.configSources.figmaApiKey).toBe("cli");
    });

    it("should use ENV figma-api-key when CLI not provided", () => {
      process.env.FIGMA_API_KEY = "env-key";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({}),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.auth.figmaApiKey).toBe("env-key");
      expect(config.configSources.figmaApiKey).toBe("env");
    });

    it("should prefer OAuth when both tokens provided", () => {
      process.env.FIGMA_API_KEY = "api-key";
      process.env.FIGMA_OAUTH_TOKEN = "oauth-token";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({}),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.auth.useOAuth).toBe(true);
      expect(config.auth.figmaOAuthToken).toBe("oauth-token");
    });

    it("should exit when no authentication provided", () => {
      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({}),
      };
      mockYargs.mockReturnValue(yargsChain);

      getServerConfig(false);

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("FIGMA_API_KEY or FIGMA_OAUTH_TOKEN is required"),
      );
    });
  });

  describe("Configuration options priority", () => {
    it("should use CLI port over ENV port", () => {
      process.env.FIGMA_API_KEY = "test-key";
      process.env.PORT = "4000";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({ port: 5000 }),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.port).toBe(5000);
      expect(config.configSources.port).toBe("cli");
    });

    it("should use CLI json flag to set outputFormat", () => {
      process.env.FIGMA_API_KEY = "test-key";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({ json: true }),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.outputFormat).toBe("json");
      expect(config.configSources.outputFormat).toBe("cli");
    });

    it("should use default values when neither CLI nor ENV provided", () => {
      process.env.FIGMA_API_KEY = "test-key";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({}),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.port).toBe(3333);
      expect(config.outputFormat).toBe("yaml");
      expect(config.skipImageDownloads).toBe(false);
      expect(config.enableAiRules).toBe(false);
    });
  });

  describe("Boolean flags handling", () => {
    it("should handle skip-image-downloads flag", () => {
      process.env.FIGMA_API_KEY = "test-key";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({ "skip-image-downloads": true }),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.skipImageDownloads).toBe(true);
      expect(config.configSources.skipImageDownloads).toBe("cli");
    });

    it("should handle enable-ai-rules flag", () => {
      process.env.FIGMA_API_KEY = "test-key";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({ "enable-ai-rules": true }),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.enableAiRules).toBe(true);
      expect(config.configSources.enableAiRules).toBe("cli");
    });

    it("should parse boolean ENV values correctly", () => {
      process.env.FIGMA_API_KEY = "test-key";
      process.env.SKIP_IMAGE_DOWNLOADS = "true";
      process.env.ENABLE_AI_RULES = "true";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({}),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.skipImageDownloads).toBe(true);
      expect(config.enableAiRules).toBe(true);
    });
  });

  describe("Logging behavior", () => {
    it("should log configuration in HTTP mode", () => {
      process.env.FIGMA_API_KEY = "test-key-1234";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({}),
      };
      mockYargs.mockReturnValue(yargsChain);

      getServerConfig(false);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Configuration"));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("****1234"));
    });

    it("should not log configuration in stdio mode", () => {
      process.env.FIGMA_API_KEY = "test-key";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({}),
      };
      mockYargs.mockReturnValue(yargsChain);

      getServerConfig(true);

      expect(console.log).not.toHaveBeenCalled();
    });

    it("should mask API key in logs", () => {
      process.env.FIGMA_API_KEY = "very-secret-key-abcd1234";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({}),
      };
      mockYargs.mockReturnValue(yargsChain);

      getServerConfig(false);

      const logCalls = (console.log as any).mock.calls.flat().join(" ");
      expect(logCalls).not.toContain("very-secret-key");
      expect(logCalls).toContain("****1234");
    });
  });

  describe("Custom env file handling", () => {
    it("should use custom env file path from CLI", () => {
      process.env.FIGMA_API_KEY = "test-key";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({ env: "/custom/.env" }),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.configSources.envFile).toBe("cli");
      expect(mockLoadEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          override: true,
        }),
      );
    });

    it("should use default env file when not specified", () => {
      process.env.FIGMA_API_KEY = "test-key";

      const yargsChain = {
        options: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue({}),
      };
      mockYargs.mockReturnValue(yargsChain);

      const config = getServerConfig(false);

      expect(config.configSources.envFile).toBe("default");
    });
  });
});
