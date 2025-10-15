import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";

// Mock fs module
vi.mock("fs");

// Import after mocking
import { Logger, writeLogs } from "./logger.js";

describe("logger.ts - Logging utilities", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    Logger.isHTTP = false; // Reset to default
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("Logger output routing based on isHTTP flag", () => {
    it("should route log/info/warn to console.error when isHTTP is false", () => {
      Logger.isHTTP = false;

      Logger.log("log message");
      Logger.info("info message");
      Logger.warn("warn message");

      expect(consoleErrorSpy).toHaveBeenCalledWith("[INFO]", "log message");
      expect(consoleErrorSpy).toHaveBeenCalledWith("[INFO]", "info message");
      expect(consoleErrorSpy).toHaveBeenCalledWith("[WARN]", "warn message");
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("should route log/info/warn to console.log when isHTTP is true", () => {
      Logger.isHTTP = true;

      Logger.log("log message");
      Logger.info("info message");
      Logger.warn("warn message");

      expect(consoleLogSpy).toHaveBeenCalledWith("[INFO]", "log message");
      expect(consoleLogSpy).toHaveBeenCalledWith("[INFO]", "info message");
      expect(consoleLogSpy).toHaveBeenCalledWith("[WARN]", "warn message");
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should always route error to console.error regardless of isHTTP", () => {
      // Test with isHTTP = false
      Logger.isHTTP = false;
      Logger.error("error1");
      expect(consoleErrorSpy).toHaveBeenCalledWith("[ERROR]", "error1");
      expect(consoleLogSpy).not.toHaveBeenCalled();

      vi.clearAllMocks();

      // Test with isHTTP = true
      Logger.isHTTP = true;
      Logger.error("error2");
      expect(consoleErrorSpy).toHaveBeenCalledWith("[ERROR]", "error2");
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe("Logger argument handling", () => {
    it("should handle multiple arguments of various types", () => {
      const obj = { key: "value" };
      const arr = [1, 2, 3];
      const error = new Error("test");

      Logger.log("message", 123, obj, arr);
      Logger.error("error:", error);

      expect(consoleErrorSpy).toHaveBeenCalledWith("[INFO]", "message", 123, obj, arr);
      expect(consoleErrorSpy).toHaveBeenCalledWith("[ERROR]", "error:", error);
    });
  });

  describe("writeLogs - Environment-based behavior", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("should write logs only in development mode", () => {
      const mockAccessSync = vi.mocked(fs.accessSync);
      const mockExistsSync = vi.mocked(fs.existsSync);
      const mockWriteFileSync = vi.mocked(fs.writeFileSync);

      mockAccessSync.mockImplementation(() => undefined);
      mockExistsSync.mockReturnValue(true);

      // Test development mode - should write
      process.env.NODE_ENV = "development";
      writeLogs("dev.json", { data: "dev" });
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "logs/dev.json",
        JSON.stringify({ data: "dev" }, null, 2)
      );

      vi.clearAllMocks();

      // Test production mode - should not write
      process.env.NODE_ENV = "production";
      writeLogs("prod.json", { data: "prod" });
      expect(mockWriteFileSync).not.toHaveBeenCalled();

      vi.clearAllMocks();

      // Test undefined NODE_ENV - should not write
      delete process.env.NODE_ENV;
      writeLogs("undef.json", { data: "undef" });
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });
  });

  describe("writeLogs - File system operations", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("should create logs directory if it doesn't exist", () => {
      const mockAccessSync = vi.mocked(fs.accessSync);
      const mockExistsSync = vi.mocked(fs.existsSync);
      const mockMkdirSync = vi.mocked(fs.mkdirSync);
      const mockWriteFileSync = vi.mocked(fs.writeFileSync);

      mockAccessSync.mockImplementation(() => undefined);
      mockExistsSync.mockReturnValue(false);
      mockMkdirSync.mockImplementation(() => undefined);

      writeLogs("test.json", { data: "test" });

      expect(mockMkdirSync).toHaveBeenCalledWith("logs", { recursive: true });
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it("should handle various error scenarios gracefully", () => {
      const mockAccessSync = vi.mocked(fs.accessSync);

      // Test Error object
      mockAccessSync.mockImplementation(() => {
        throw new Error("Access denied");
      });
      writeLogs("error1.json", { data: "test" });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[INFO]",
        "Failed to write logs to error1.json: Access denied"
      );

      vi.clearAllMocks();

      // Test non-Error exception
      mockAccessSync.mockImplementation(() => {
        throw "String error";
      });
      writeLogs("error2.json", { data: "test" });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[INFO]",
        "Failed to write logs to error2.json: String error"
      );
    });

    it("should format JSON with proper indentation", () => {
      const mockAccessSync = vi.mocked(fs.accessSync);
      const mockExistsSync = vi.mocked(fs.existsSync);
      const mockWriteFileSync = vi.mocked(fs.writeFileSync);

      mockAccessSync.mockImplementation(() => undefined);
      mockExistsSync.mockReturnValue(true);

      const complexData = {
        level1: { level2: { value: 123, array: [1, 2, 3] } },
      };

      writeLogs("complex.json", complexData);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        "logs/complex.json",
        JSON.stringify(complexData, null, 2)
      );
    });
  });
});
