/**
 * Official Handlebars Template Processor
 *
 * Uses the official Handlebars library for reliable template compilation
 */

import fs from "fs/promises";
import Handlebars from "handlebars";

export class HandlebarsProcessor {
  constructor() {
    // Register all helper functions with Handlebars
    this.registerHelpers();
  }

  registerHelpers() {
    const helpers = {
      // String helpers
      titleCase: (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "",

      pascalCase: (str) => {
        if (!str) return "";
        return str
          .split(/[_\s-]+/)
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("");
      },

      camelCase: (str) => {
        if (!str) return "";
        const pascal = helpers.pascalCase(str);
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
      },

      // Array helpers
      includes: (array, item) => Array.isArray(array) && array.includes(item),

      // JSON helpers
      json: (obj) => JSON.stringify(obj, null, 2),

      // Validation helpers
      getMaxLength: (validationRules) => {
        if (!Array.isArray(validationRules)) return 255;
        const maxLengthRule = validationRules.find(
          (rule) => typeof rule === "string" && rule.startsWith("maxLength:")
        );
        return maxLengthRule ? parseInt(maxLengthRule.split(":")[1]) : 255;
      },

      // UI helpers
      getDefaultWidth: (uiType) => {
        const widths = {
          text: 150,
          number: 100,
          datetime: 180,
          date: 120,
          checkbox: 80,
          select: 120,
          textarea: 200,
          currency: 120,
          email: 180,
          phone: 140,
        };
        return widths[uiType] || 150;
      },

      // Conditional helpers
      eq: (a, b) => a === b,
      ne: (a, b) => a !== b,
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
      gte: (a, b) => a >= b,
      lte: (a, b) => a <= b,
      and: (a, b) => a && b,
      or: (a, b) => a || b,
      not: (a) => !a,
    };

    // Register all helpers with Handlebars
    Object.keys(helpers).forEach((name) => {
      Handlebars.registerHelper(name, helpers[name]);
    });

    console.log(
      `📝 Registered ${Object.keys(helpers).length} Handlebars helpers`
    );
  }

  /**
   * Process a Handlebars template with data
   */
  async processTemplate(templatePath, data) {
    try {
      const templateContent = await fs.readFile(templatePath, "utf-8");
      const template = Handlebars.compile(templateContent);
      return template(data);
    } catch (error) {
      throw new Error(
        `Failed to process template ${templatePath}: ${error.message}`
      );
    }
  }

  /**
   * Preserve manual zones when regenerating
   */
  preserveManualZones(existingContent, newContent) {
    const manualZoneRegex =
      /\/\/ ✋ MANUAL CUSTOMIZATION ZONE[\s\S]*?\/\/ ✋ END MANUAL CUSTOMIZATION ZONE/g;

    const existingZones = [];
    let match;
    while ((match = manualZoneRegex.exec(existingContent)) !== null) {
      existingZones.push(match[0]);
    }

    if (existingZones.length === 0) {
      return newContent;
    }

    // Replace manual zones in new content with existing ones
    let result = newContent;
    let zoneIndex = 0;

    result = result.replace(manualZoneRegex, (match) => {
      return zoneIndex < existingZones.length
        ? existingZones[zoneIndex++]
        : match;
    });

    return result;
  }
}

export const handlebarsProcessor = new HandlebarsProcessor();
