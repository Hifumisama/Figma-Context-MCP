import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted to ensure mockExecAsync is available during mock setup
const { mockExecAsync, mockFetch } = vi.hoisted(() => ({
  mockExecAsync: vi.fn(),
  mockFetch: vi.fn(),
}));

// Mock dependencies before module imports
vi.mock("util", () => ({
  promisify: () => mockExecAsync,
}));

vi.mock("child_process", () => ({ exec: vi.fn() }));
vi.mock("./logger.js", () => ({ Logger: { log: vi.fn(), error: vi.fn() } }));

import { fetchWithRetry } from "./fetch-with-retry.js";

global.fetch = mockFetch;

describe("fetch-with-retry.ts - Fetch with curl fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Successful fetch", () => {
    it("should fetch and parse JSON response", async () => {
      const mockData = { id: "123", name: "Test" };
      mockFetch.mockResolvedValue({ ok: true, json: async () => mockData });

      const result = await fetchWithRetry<typeof mockData>("https://api.example.com/data");

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data", {});
    });

    it("should pass request options to fetch", async () => {
      const mockData = { success: true };
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" }),
      };

      mockFetch.mockResolvedValue({ ok: true, json: async () => mockData });

      await fetchWithRetry<typeof mockData>("https://api.example.com/create", options);

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/create", options);
    });

    it("should handle null/empty responses", async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => null });

      const result = await fetchWithRetry<null>("https://api.example.com/empty");

      expect(result).toBeNull();
    });
  });

  describe("Fetch failures (with curl fallback failure)", () => {
    it("should throw error on HTTP error statuses when curl also fails", async () => {
      mockExecAsync.mockRejectedValue(new Error("curl also failed"));

      // Test multiple HTTP status codes
      const errorCases = [
        { status: 404, statusText: "Not Found" },
        { status: 401, statusText: "Unauthorized" },
        { status: 500, statusText: "Internal Server Error" },
      ];

      for (const { status, statusText } of errorCases) {
        mockFetch.mockResolvedValue({ ok: false, status, statusText });

        await expect(fetchWithRetry("https://api.example.com/test")).rejects.toThrow(
          `Fetch failed with status ${status}: ${statusText}`
        );

        vi.clearAllMocks();
      }
    });
  });

  describe("Curl fallback success", () => {
    it("should fallback to curl on fetch failure and parse response", async () => {
      const mockData = { fallback: true };
      mockFetch.mockRejectedValue(new Error("Network error"));
      mockExecAsync.mockResolvedValue({ stdout: JSON.stringify(mockData), stderr: "" });

      const result = await fetchWithRetry<typeof mockData>("https://api.example.com/data");

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockExecAsync).toHaveBeenCalledTimes(1);
    });

    it("should include request headers in curl command", async () => {
      const mockData = { authenticated: true };
      mockFetch.mockRejectedValue(new Error("Network error"));

      mockExecAsync.mockImplementation(async (command: string) => {
        expect(command).toContain('-H "Authorization: Bearer token123"');
        expect(command).toContain('-H "Content-Type: application/json"');
        return { stdout: JSON.stringify(mockData), stderr: "" };
      });

      const options = {
        headers: {
          Authorization: "Bearer token123",
          "Content-Type": "application/json",
        },
      };

      await fetchWithRetry<typeof mockData>("https://api.example.com/secure", options);
    });

    it("should handle informational stderr messages", async () => {
      const mockData = { success: true };
      mockFetch.mockRejectedValue(new Error("Network error"));

      mockExecAsync.mockResolvedValue({
        stdout: JSON.stringify(mockData),
        stderr: "  % Total    % Received % Xferd  Average Speed",
      });

      const result = await fetchWithRetry<typeof mockData>("https://api.example.com/data");

      expect(result).toEqual(mockData);
    });

    it("should handle complex JSON structures", async () => {
      const complexData = {
        nested: { object: { with: { deeply: { nested: { value: 123 } } } } },
        array: [1, 2, 3, { key: "value" }],
      };
      mockFetch.mockRejectedValue(new Error("Network error"));
      mockExecAsync.mockResolvedValue({ stdout: JSON.stringify(complexData), stderr: "" });

      const result = await fetchWithRetry<typeof complexData>("https://api.example.com/complex");

      expect(result).toEqual(complexData);
    });
  });

  describe("Curl fallback failures", () => {
    it("should throw original error when curl fails with error keywords", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const curlErrors = [
        { stdout: '{"data": "test"}', stderr: "curl: (6) Could not resolve host: error occurred" },
        { stdout: '{"data": "test"}', stderr: "Request failed with status 404" },
        { stdout: "", stderr: "" },
      ];

      for (const { stdout, stderr } of curlErrors) {
        mockExecAsync.mockResolvedValue({ stdout, stderr });

        await expect(fetchWithRetry("https://api.example.com/data")).rejects.toThrow("Network error");

        vi.clearAllMocks();
        mockFetch.mockRejectedValue(new Error("Network error"));
      }
    });

    it("should throw original error when curl command execution fails", async () => {
      const originalError = new Error("Original network error");
      mockFetch.mockRejectedValue(originalError);
      mockExecAsync.mockRejectedValue(new Error("curl command not found"));

      await expect(fetchWithRetry("https://api.example.com/data")).rejects.toThrow(
        "Original network error"
      );
    });
  });

  describe("Header handling edge cases", () => {
    it("should work without headers in options", async () => {
      const mockData = { test: true };
      mockFetch.mockResolvedValue({ ok: true, json: async () => mockData });

      const result = await fetchWithRetry<typeof mockData>("https://api.example.com/data", { method: "GET" });

      expect(result).toEqual(mockData);
    });

    it("should not add -H flag to curl when headers are empty or undefined", async () => {
      const mockData = { fallback: true };
      mockFetch.mockRejectedValue(new Error("Network error"));

      mockExecAsync.mockImplementation(async (command: string) => {
        expect(command).not.toContain("-H ");
        return { stdout: JSON.stringify(mockData), stderr: "" };
      });

      // Test with no headers
      await fetchWithRetry<typeof mockData>("https://api.example.com/data");

      vi.clearAllMocks();
      mockFetch.mockRejectedValue(new Error("Network error"));

      // Test with empty headers object
      await fetchWithRetry<typeof mockData>("https://api.example.com/data", { headers: {} });
    });
  });
});
