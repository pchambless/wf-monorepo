/**
 * Unit tests for Document Metadata Extraction Utilities
 * Part of Plan 0018 Phase 3: Document Management Integration
 */

const {
  extractPlanId,
  extractTitle,
  determineDocumentType,
  generateFallbackTitle,
  parseDocumentMetadata,
  PLAN_ID_PATTERNS,
} = require("../documentMetadata");

describe("Document Metadata Extraction", () => {
  describe("extractPlanId", () => {
    test("extracts plan ID from 4-digit format", () => {
      expect(extractPlanId(".kiro/specs/0019-feature-name/design.md")).toBe(19);
      expect(extractPlanId(".kiro/specs/0001-initial/requirements.md")).toBe(1);
    });

    test("extracts plan ID from plan-prefix format", () => {
      expect(extractPlanId(".kiro/specs/plan-19-feature/design.md")).toBe(19);
      expect(extractPlanId(".kiro/specs/Plan-20-Test/design.md")).toBe(20);
    });

    test("extracts plan ID from simple number format", () => {
      expect(extractPlanId(".kiro/specs/19-feature/design.md")).toBe(19);
      expect(extractPlanId(".kiro/specs/5-simple/design.md")).toBe(5);
    });

    test("returns 0 for no plan association", () => {
      expect(extractPlanId(".kiro/specs/general-feature/design.md")).toBe(0);
      expect(extractPlanId(".kiro/issues/bug-report.md")).toBe(0);
    });

    test("handles Windows paths", () => {
      expect(extractPlanId(".kiro\\specs\\0019-feature\\design.md")).toBe(19);
    });
  });

  describe("extractTitle", () => {
    test("extracts title from first heading", () => {
      const content = "# Feature Design\n\nThis is the content...";
      expect(extractTitle(content)).toBe("Feature Design");
    });

    test("extracts title with extra whitespace", () => {
      const content = "#   Spaced Title   \n\nContent...";
      expect(extractTitle(content)).toBe("Spaced Title");
    });

    test("ignores subsequent headings", () => {
      const content = "# First Title\n\n## Second Heading\n\n# Third Title";
      expect(extractTitle(content)).toBe("First Title");
    });

    test("returns null for no heading", () => {
      const content = "Just some content without headings";
      expect(extractTitle(content)).toBeNull();
    });

    test("returns null for empty content", () => {
      expect(extractTitle("")).toBeNull();
      expect(extractTitle(null)).toBeNull();
      expect(extractTitle(undefined)).toBeNull();
    });
  });

  describe("determineDocumentType", () => {
    test("identifies spec documents", () => {
      expect(determineDocumentType(".kiro/specs/0019-feature/design.md")).toBe(
        "spec"
      );
      expect(determineDocumentType(".kiro/specs/general/requirements.md")).toBe(
        "spec"
      );
    });

    test("identifies issue documents", () => {
      expect(determineDocumentType(".kiro/issues/bug-report.md")).toBe("issue");
      expect(determineDocumentType(".kiro/issues/001-critical-bug.md")).toBe(
        "issue"
      );
    });

    test("handles Windows paths", () => {
      expect(determineDocumentType(".kiro\\specs\\feature\\design.md")).toBe(
        "spec"
      );
      expect(determineDocumentType(".kiro\\issues\\bug.md")).toBe("issue");
    });

    test("returns unknown for other paths", () => {
      expect(determineDocumentType("docs/readme.md")).toBe("unknown");
      expect(determineDocumentType(".kiro/other/file.md")).toBe("unknown");
    });
  });

  describe("generateFallbackTitle", () => {
    test("converts filename to title case", () => {
      expect(generateFallbackTitle("design.md")).toBe("Design");
      expect(generateFallbackTitle("requirements.md")).toBe("Requirements");
    });

    test("handles kebab-case filenames", () => {
      expect(generateFallbackTitle("feature-design.md")).toBe("Feature Design");
      expect(generateFallbackTitle("api-integration-guide.md")).toBe(
        "Api Integration Guide"
      );
    });

    test("handles snake_case filenames", () => {
      expect(generateFallbackTitle("user_guide.md")).toBe("User Guide");
      expect(generateFallbackTitle("technical_requirements.md")).toBe(
        "Technical Requirements"
      );
    });

    test("handles full paths", () => {
      expect(
        generateFallbackTitle(".kiro/specs/0019-feature/design-document.md")
      ).toBe("Design Document");
    });
  });

  describe("parseDocumentMetadata", () => {
    test("parses complete metadata with title", () => {
      const filePath = ".kiro/specs/0019-feature-name/design.md";
      const content =
        "# Feature Design Document\n\nThis describes the feature...";

      const result = parseDocumentMetadata(filePath, content);

      expect(result).toEqual({
        plan_id: 19,
        document_type: "spec",
        file_path: ".kiro/specs/0019-feature-name/design.md",
        title: "Feature Design Document",
        author: "kiro",
        status: "draft",
        created_by: "kiro",
      });
    });

    test("uses fallback title when no heading found", () => {
      const filePath = ".kiro/issues/critical-bug-fix.md";
      const content = "Just some content without headings";

      const result = parseDocumentMetadata(filePath, content);

      expect(result).toEqual({
        plan_id: 0,
        document_type: "issue",
        file_path: ".kiro/issues/critical-bug-fix.md",
        title: "Critical Bug Fix",
        author: "kiro",
        status: "draft",
        created_by: "kiro",
      });
    });

    test("handles orphaned documents", () => {
      const filePath = ".kiro/specs/general-notes/misc.md";
      const content = "# General Notes\n\nMiscellaneous content...";

      const result = parseDocumentMetadata(filePath, content);

      expect(result.plan_id).toBe(0);
      expect(result.title).toBe("General Notes");
    });
  });

  describe("PLAN_ID_PATTERNS", () => {
    test("patterns are properly defined", () => {
      expect(PLAN_ID_PATTERNS).toHaveLength(3);
      expect(PLAN_ID_PATTERNS[0]).toBeInstanceOf(RegExp);
    });
  });
});
