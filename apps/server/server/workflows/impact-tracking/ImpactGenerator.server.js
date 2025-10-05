/**
 * Impact Generator for Automatic Impact Tracking
 *
 * Generates intelligent descriptions and categorizes file changes
 * Part of automatic-impact-tracking spec
 */

import path from "path";

class ImpactGenerator {
  constructor() {
    // File type mappings for better descriptions
    this.fileTypeMap = {
      ".jsx": "React component",
      ".tsx": "React component",
      ".js": "JavaScript module",
      ".ts": "TypeScript module",
      ".css": "stylesheet",
      ".scss": "stylesheet",
      ".sass": "stylesheet",
      ".less": "stylesheet",
      ".md": "documentation",
      ".json": "configuration",
      ".yml": "configuration",
      ".yaml": "configuration",
      ".xml": "configuration",
      ".html": "template",
      ".vue": "Vue component",
      ".py": "Python module",
      ".java": "Java class",
      ".php": "PHP module",
      ".rb": "Ruby module",
      ".go": "Go module",
      ".rs": "Rust module",
      ".cpp": "C++ source",
      ".c": "C source",
      ".h": "header file",
      ".sql": "database script",
    };

    // Path-based categorization patterns
    this.pathCategories = {
      components: "component",
      services: "service",
      utils: "utility",
      utilities: "utility",
      helpers: "helper",
      lib: "library",
      api: "API",
      routes: "route",
      controllers: "controller",
      models: "model",
      views: "view",
      templates: "template",
      styles: "stylesheet",
      assets: "asset",
      config: "configuration",
      middleware: "middleware",
      hooks: "hook",
      store: "store",
      reducers: "reducer",
      actions: "action",
      selectors: "selector",
    };
  }

  /**
   * Generate description for file change
   */
  generateDescription(
    filePath,
    changeType,
    context = {},
    batchDescription = null
  ) {
    let description = "";

    // Add batch context if available
    if (batchDescription) {
      description += `${batchDescription} - `;
    }

    // Generate change-specific description
    const fileType = this.getFileType(filePath);
    const category = this.getPathCategory(filePath);

    switch (changeType) {
      case "CREATE":
        description += `Created ${fileType}`;
        break;
      case "MODIFY":
        description += `Modified ${fileType}`;
        break;
      case "DELETE":
        description += `Deleted ${fileType}`;
        break;
      default:
        description += `Changed ${fileType}`;
    }

    // Add category context if different from file type
    if (category && category !== fileType && !fileType.includes(category)) {
      description += ` (${category})`;
    }

    // Add context-specific details
    if (context.purpose) {
      description += ` - ${context.purpose}`;
    }

    // Add feature context from file path
    const featureContext = this.extractFeatureContext(filePath);
    if (featureContext) {
      description += ` for ${featureContext}`;
    }

    return description;
  }

  /**
   * Get file type description from extension
   */
  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    // Check known extensions
    if (this.fileTypeMap[ext]) {
      return this.fileTypeMap[ext];
    }

    // Special cases
    if (fileName === "package.json") return "package configuration";
    if (fileName === "README.md") return "README documentation";
    if (fileName === "Dockerfile") return "Docker configuration";
    if (fileName.startsWith(".env")) return "environment configuration";
    if (fileName.endsWith(".config.js")) return "configuration file";
    if (fileName.endsWith(".test.js") || fileName.endsWith(".spec.js"))
      return "test file";

    // Default to filename if no extension match
    return fileName;
  }

  /**
   * Get category from file path
   */
  getPathCategory(filePath) {
    const pathParts = filePath.toLowerCase().split("/");

    // Check each path part for known categories
    for (const part of pathParts) {
      if (this.pathCategories[part]) {
        return this.pathCategories[part];
      }
    }

    // Check for partial matches
    for (const part of pathParts) {
      for (const [pattern, category] of Object.entries(this.pathCategories)) {
        if (part.includes(pattern)) {
          return category;
        }
      }
    }

    return null;
  }

  /**
   * Extract feature context from file path
   */
  extractFeatureContext(filePath) {
    const pathParts = filePath.split("/");

    // Look for feature indicators in path
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];

      // Check for feature folders
      if (part === "features" && i + 1 < pathParts.length) {
        return pathParts[i + 1];
      }

      // Check for spec folders
      if (part === "specs" && i + 1 < pathParts.length) {
        return `${pathParts[i + 1]} spec`;
      }

      // Check for plan folders
      if (part.match(/^\d{4}$/) && i + 1 < pathParts.length) {
        return `Plan ${part}`;
      }

      // Check for component/module names
      if (part.includes("-") && part.length > 3) {
        return part.replace(/-/g, " ");
      }
    }

    return null;
  }

  /**
   * Check if file is a React component
   */
  isComponentFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath, ext);

    return (
      (ext === ".jsx" || ext === ".tsx") &&
      (fileName[0] === fileName[0].toUpperCase() ||
        filePath.includes("/components/"))
    );
  }

  /**
   * Check if file is a utility
   */
  isUtilityFile(filePath) {
    return (
      filePath.includes("/utils/") ||
      filePath.includes("/utilities/") ||
      filePath.includes("/helpers/") ||
      path.basename(filePath).includes("util") ||
      path.basename(filePath).includes("helper")
    );
  }

  /**
   * Check if file is a service
   */
  isServiceFile(filePath) {
    return (
      filePath.includes("/services/") ||
      filePath.includes("/api/") ||
      path.basename(filePath).includes("service") ||
      path.basename(filePath).includes("api")
    );
  }

  /**
   * Check if file is configuration
   */
  isConfigFile(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();

    return (
      fileName.includes("config") ||
      fileName.startsWith(".") ||
      [".json", ".yml", ".yaml", ".xml"].includes(ext) ||
      fileName === "package.json" ||
      fileName === "Dockerfile"
    );
  }

  /**
   * Generate context-aware description with additional metadata
   */
  generateRichDescription(filePath, changeType, context = {}) {
    const baseDescription = this.generateDescription(
      filePath,
      changeType,
      context
    );

    const metadata = {
      fileType: this.getFileType(filePath),
      category: this.getPathCategory(filePath),
      isComponent: this.isComponentFile(filePath),
      isUtility: this.isUtilityFile(filePath),
      isService: this.isServiceFile(filePath),
      isConfig: this.isConfigFile(filePath),
      featureContext: this.extractFeatureContext(filePath),
    };

    return {
      description: baseDescription,
      metadata: metadata,
    };
  }
}

export default ImpactGenerator;
