/**
 * Template Processing Utilities
 *
 * Utilities for processing dual-zone templates with entity data
 * Handles template variable substitution, helper functions, and zone preservation
 */

import fs from "fs/promises";
import path from "path";

/**
 * Template processing utilities
 */
export class TemplateProcessor {
  constructor() {
    this.helpers = {
      // String helpers
      titleCase: (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1) : "",
      camelCase: (str) =>
        str ? str.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) : "",

      // Array helpers
      includes: (array, item) => Array.isArray(array) && array.includes(item),

      // JSON helpers
      json: (obj) => JSON.stringify(obj, null, 2),

      // Validation helpers
      getMaxLength: (validationRules) => {
        const maxLengthRule = validationRules.find((rule) =>
          rule.startsWith("maxLength:")
        );
        return maxLengthRule ? parseInt(maxLengthRule.split(":")[1]) : 255;
      },

      // UI helpers
      getDefaultWidth: (uiType) => {
        const widths = {
          text: 150,
          number: 100,
          datetime: 180,
          checkbox: 80,
          select: 120,
        };
        return widths[uiType] || 150;
      },

      // Conditional helpers
      eq: (a, b) => a === b,
      ne: (a, b) => a !== b,
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
    };
  }

  /**
   * Process a template with entity data
   * @param {string} templateContent - The template content
   * @param {Object} entityData - The entity data from JSON files
   * @param {Object} options - Processing options
   * @returns {string} Processed template content
   */
  processTemplate(templateContent, entityData, options = {}) {
    let processed = templateContent;

    // Basic variable substitution
    processed = this.substituteVariables(processed, entityData);

    // Process conditional blocks
    processed = this.processConditionals(processed, entityData);

    // Process loops
    processed = this.processLoops(processed, entityData);

    // Apply helper functions
    processed = this.applyHelpers(processed, entityData);

    return processed;
  }

  /**
   * Substitute template variables like {{entityName}}
   */
  substituteVariables(content, data) {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const value = this.getNestedValue(data, variable.trim());
      return value !== undefined ? value : match;
    });
  }

  /**
   * Process conditional blocks like {{#if condition}}...{{/if}}
   */
  processConditionals(content, data) {
    // Handle {{#if}} blocks
    content = content.replace(
      /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, condition, block) => {
        const conditionValue = this.evaluateCondition(condition, data);
        return conditionValue ? block : "";
      }
    );

    // Handle {{#unless}} blocks
    content = content.replace(
      /\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g,
      (match, condition, block) => {
        const conditionValue = this.evaluateCondition(condition, data);
        return !conditionValue ? block : "";
      }
    );

    return content;
  }

  /**
   * Process loop blocks like {{#each fields}}...{{/each}}
   */
  processLoops(content, data) {
    return content.replace(
      /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, arrayPath, block) => {
        const array = this.getNestedValue(data, arrayPath.trim());
        if (!Array.isArray(array)) return "";

        return array
          .map((item, index) => {
            let processedBlock = block;

            // Substitute item properties
            processedBlock = processedBlock.replace(
              /\{\{([^}]+)\}\}/g,
              (match, prop) => {
                if (prop === "@index") return index;
                if (prop === "@last") return index === array.length - 1;
                if (prop === "@first") return index === 0;

                const value = this.getNestedValue(item, prop.trim());
                return value !== undefined ? value : match;
              }
            );

            return processedBlock;
          })
          .join("");
      }
    );
  }

  /**
   * Apply helper functions
   */
  applyHelpers(content, data) {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      // Check if it's a helper function call
      const helperMatch = expression.match(/^(\w+)\s+(.+)$/);
      if (helperMatch) {
        const [, helperName, args] = helperMatch;
        const helper = this.helpers[helperName];

        if (helper) {
          // Parse arguments (simple implementation)
          const argValues = args.split(/\s+/).map((arg) => {
            if (arg.startsWith('"') && arg.endsWith('"')) {
              return arg.slice(1, -1); // String literal
            }
            return this.getNestedValue(data, arg); // Variable reference
          });

          return helper(...argValues);
        }
      }

      return match;
    });
  }

  /**
   * Evaluate conditional expressions
   */
  evaluateCondition(condition, data) {
    // Handle helper function conditions like (includes validationRules "required")
    const helperMatch = condition.match(/\((\w+)\s+([^)]+)\)/);
    if (helperMatch) {
      const [, helperName, args] = helperMatch;
      const helper = this.helpers[helperName];

      if (helper) {
        const argValues = args.split(/\s+/).map((arg) => {
          if (arg.startsWith('"') && arg.endsWith('"')) {
            return arg.slice(1, -1);
          }
          return this.getNestedValue(data, arg);
        });

        return helper(...argValues);
      }
    }

    // Simple variable evaluation
    const value = this.getNestedValue(data, condition);
    return !!value;
  }

  /**
   * Get nested object value by path (e.g., "user.name" from {user: {name: "John"}})
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Load and process a template file
   */
  async loadAndProcessTemplate(templatePath, entityData, options = {}) {
    try {
      const templateContent = await fs.readFile(templatePath, "utf-8");
      return this.processTemplate(templateContent, entityData, options);
    } catch (error) {
      throw new Error(
        `Failed to load template ${templatePath}: ${error.message}`
      );
    }
  }

  /**
   * Generate template context from entity JSON
   */
  generateTemplateContext(entityJson, options = {}) {
    const context = {
      // Basic entity info
      entityName: entityJson.name,
      EntityName: this.helpers.titleCase(entityJson.name),
      tableName: entityJson.tableName || `api_wf.${entityJson.name}`,
      primaryKey: entityJson.primaryKey || "id",

      // Fields
      fields: entityJson.fields || [],

      // Metadata
      schemaSource: options.schemaSource || "entity.json",
      generatedDate: new Date().toISOString(),

      // Derived properties
      hiddenInTable: ["id", "created_at", "updated_at", "deleted_at"],
      hiddenInForm: ["id", "created_at", "updated_at", "deleted_at"],
      searchableFields: ["name", "description", "title"],
      filterableFields: ["status", "type", "category"],

      // Parent relationships
      parentKey: entityJson.parentKey || null,
      parentTable: entityJson.parentTable || null,

      ...options.additionalContext,
    };

    return context;
  }

  /**
   * Preserve manual zones when regenerating
   */
  preserveManualZones(existingContent, newContent) {
    const manualZoneRegex =
      /\/\/ ✋ MANUAL CUSTOMIZATION ZONE[\s\S]*?\/\/ ✋ END MANUAL CUSTOMIZATION ZONE/g;
    const existingZones = existingContent.match(manualZoneRegex) || [];

    let preserved = newContent;
    existingZones.forEach((zone, index) => {
      const zoneMarker = `// ✋ MANUAL CUSTOMIZATION ZONE`;
      const zoneEnd = `// ✋ END MANUAL CUSTOMIZATION ZONE`;

      const startIndex = preserved.indexOf(zoneMarker);
      const endIndex = preserved.indexOf(zoneEnd, startIndex);

      if (startIndex !== -1 && endIndex !== -1) {
        const before = preserved.substring(0, startIndex);
        const after = preserved.substring(endIndex + zoneEnd.length);
        preserved = before + zone + after;
      }
    });

    return preserved;
  }
}

/**
 * Default template processor instance
 */
export const templateProcessor = new TemplateProcessor();

/**
 * Convenience functions
 */
export async function processTemplate(templatePath, entityData, options = {}) {
  return await templateProcessor.loadAndProcessTemplate(
    templatePath,
    entityData,
    options
  );
}

export function generateContext(entityJson, options = {}) {
  return templateProcessor.generateTemplateContext(entityJson, options);
}

export default templateProcessor;
