/**
 * Test file operations exports from shared-imports
 */

import { describe, test, expect } from "@jest/globals";

describe("Shared Imports Exports", () => {
  test("should export createDoc from utils index", async () => {
    const { createDoc } = await import("../index.js");
    expect(typeof createDoc).toBe("function");
  });

  test("should export file operation utilities", async () => {
    const {
      validateInputs,
      validateFileName,
      validateSecurity,
      ensureDirectory,
      directoryExists,
      fileExists,
      writeFile,
      ERROR_TYPES,
      categorizeError,
    } = await import("../index.js");

    expect(typeof validateInputs).toBe("function");
    expect(typeof validateFileName).toBe("function");
    expect(typeof validateSecurity).toBe("function");
    expect(typeof ensureDirectory).toBe("function");
    expect(typeof directoryExists).toBe("function");
    expect(typeof fileExists).toBe("function");
    expect(typeof writeFile).toBe("function");
    expect(typeof ERROR_TYPES).toBe("object");
    expect(typeof categorizeError).toBe("function");
  });

  test("should export createDoc with both named and default exports", async () => {
    const { createDoc, createDocDefault } = await import("../index.js");
    expect(typeof createDoc).toBe("function");
    expect(typeof createDocDefault).toBe("function");
    expect(createDoc).toBe(createDocDefault);
  });
});
