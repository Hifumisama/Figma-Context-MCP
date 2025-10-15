import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { LLMService } from "./llm-service.js";
import type { LLMConfig } from "./llm-service.js";

// Mock dependencies
const { mockVertexAI, mockGenerativeModel, mockLogger } = vi.hoisted(() => ({
  mockVertexAI: {
    getGenerativeModel: vi.fn(),
  },
  mockGenerativeModel: {
    generateContent: vi.fn(),
  },
  mockLogger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    isHTTP: false,
  },
}));

vi.mock("@google-cloud/vertexai", () => ({
  VertexAI: vi.fn().mockImplementation(() => mockVertexAI),
}));

vi.mock("~/utils/logger.js", () => ({
  Logger: mockLogger,
}));

describe("llm-service.ts - LLM service using Vertex AI", () => {
  let config: LLMConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    config = {
      projectId: "test-project",
      location: "us-central1",
      model: "gemini-2.0-flash-lite-001",
      maxTokens: 1000,
      temperature: 0.1,
    };
    mockVertexAI.getGenerativeModel.mockReturnValue(mockGenerativeModel);
  });

  describe("Service initialization", () => {
    it("should initialize with provided config", () => {
      const service = new LLMService(config);

      expect(service).toBeDefined();
      expect((service as any).model).toBe("gemini-2.0-flash-lite-001");
      expect((service as any).maxTokens).toBe(1000);
      expect((service as any).temperature).toBe(0.1);
    });

    it("should use default values when not provided", () => {
      const service = new LLMService({ projectId: "test-project" });

      expect((service as any).model).toBe("gemini-2.0-flash-lite-001");
      expect((service as any).maxTokens).toBe(1000);
      expect((service as any).temperature).toBe(0.1);
    });
  });

  describe("LLM calls with retry logic", () => {
    it("should successfully parse JSON response on first attempt", async () => {
      const service = new LLMService(config);
      const mockResponse = { data: "test", value: 123 };

      mockGenerativeModel.generateContent.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockResponse) }],
              },
            },
          ],
        },
      });

      const result = await service.callLLM("test prompt");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockGenerativeModel.generateContent).toHaveBeenCalledOnce();
    });

    it("should retry on failure and succeed on second attempt", async () => {
      const service = new LLMService(config);
      const mockResponse = { data: "success" };

      mockGenerativeModel.generateContent
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          response: {
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify(mockResponse) }],
                },
              },
            ],
          },
        });

      const result = await service.callLLM("test prompt", 3);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockGenerativeModel.generateContent).toHaveBeenCalledTimes(2);
    });

    it("should fail after exhausting all retries", async () => {
      const service = new LLMService(config);

      mockGenerativeModel.generateContent.mockRejectedValue(new Error("Network error"));

      const result = await service.callLLM("test prompt", 2);

      expect(result.success).toBe(false);
      expect(result.error).toContain("failed after 2 attempts");
      expect(result.error).toContain("Network error");
      expect(mockGenerativeModel.generateContent).toHaveBeenCalledTimes(2);
    });

    it("should handle exponential backoff between retries", async () => {
      const service = new LLMService(config);
      const startTime = Date.now();

      mockGenerativeModel.generateContent
        .mockRejectedValueOnce(new Error("First fail"))
        .mockResolvedValueOnce({
          response: {
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify({ data: "ok" }) }],
                },
              },
            ],
          },
        });

      await service.callLLM("test prompt", 3);

      const elapsed = Date.now() - startTime;
      // First retry should wait ~2^1 * 1000 = 2000ms
      expect(elapsed).toBeGreaterThanOrEqual(1900);
    });
  });

  describe("Response validation and error handling", () => {
    it("should fail when no candidates returned", async () => {
      const service = new LLMService(config);

      mockGenerativeModel.generateContent.mockResolvedValue({
        response: { candidates: [] },
      });

      const result = await service.callLLM("test prompt", 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No candidates returned");
    });

    it("should fail when no content parts returned", async () => {
      const service = new LLMService(config);

      mockGenerativeModel.generateContent.mockResolvedValue({
        response: {
          candidates: [{ content: { parts: [] } }],
        },
      });

      const result = await service.callLLM("test prompt", 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No content parts returned");
    });

    it("should fail when text is empty", async () => {
      const service = new LLMService(config);

      mockGenerativeModel.generateContent.mockResolvedValue({
        response: {
          candidates: [{ content: { parts: [{ text: "" }] } }],
        },
      });

      const result = await service.callLLM("test prompt", 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Empty response");
    });

    it("should fail when JSON parsing fails", async () => {
      const service = new LLMService(config);

      mockGenerativeModel.generateContent.mockResolvedValue({
        response: {
          candidates: [{ content: { parts: [{ text: "invalid json {" }] } }],
        },
      });

      const result = await service.callLLM("test prompt", 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to parse JSON");
    });

    it("should handle non-Error exceptions", async () => {
      const service = new LLMService(config);

      mockGenerativeModel.generateContent.mockRejectedValue("String error");

      const result = await service.callLLM("test prompt", 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown error");
    });
  });

  describe("Factory method fromEnvironment", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset to clean state before each test
      process.env = { ...originalEnv };
      delete process.env.LLM_MODEL;
      delete process.env.LLM_MAX_TOKENS;
      delete process.env.LLM_TEMPERATURE;
      delete process.env.GOOGLE_CLOUD_LOCATION;
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("should create service from environment variables", () => {
      process.env.GOOGLE_CLOUD_PROJECT = "test-project";
      process.env.GOOGLE_CLOUD_LOCATION = "europe-west1";
      process.env.LLM_MODEL = "gemini-1.5-pro";
      process.env.LLM_MAX_TOKENS = "2000";
      process.env.LLM_TEMPERATURE = "0.5";

      const service = LLMService.fromEnvironment();

      expect(service).toBeDefined();
      expect((service as any).model).toBe("gemini-1.5-pro");
      expect((service as any).maxTokens).toBe(2000);
      expect((service as any).temperature).toBe(0.5);
    });

    it("should use default values when env vars not set", () => {
      process.env.GOOGLE_CLOUD_PROJECT = "test-project";

      const service = LLMService.fromEnvironment();

      expect((service as any).model).toBe("gemini-2.0-flash-exp");
      expect((service as any).maxTokens).toBe(8192);
      expect((service as any).temperature).toBe(0.9);
    });

    it("should throw error when GOOGLE_CLOUD_PROJECT is missing", () => {
      delete process.env.GOOGLE_CLOUD_PROJECT;

      expect(() => LLMService.fromEnvironment()).toThrow(
        "GOOGLE_CLOUD_PROJECT environment variable is required",
      );
    });
  });

  describe("Generation config", () => {
    it("should pass correct generation config to Vertex AI", async () => {
      const service = new LLMService({
        projectId: "test-project",
        maxTokens: 5000,
        temperature: 0.7,
      });

      mockGenerativeModel.generateContent.mockResolvedValue({
        response: {
          candidates: [{ content: { parts: [{ text: '{"ok": true}' }] } }],
        },
      });

      await service.callLLM("test prompt");

      expect(mockVertexAI.getGenerativeModel).toHaveBeenCalledWith({
        model: "gemini-2.0-flash-lite-001",
        generationConfig: {
          maxOutputTokens: 5000,
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });
    });
  });
});
