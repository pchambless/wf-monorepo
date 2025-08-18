/**
 * Entity Workflows Generator
 *
 * This is the gen-EntityWorkflows engine that takes entity.json files
 * and generates Entity-workflow.js + Entity-display.js files using the dual-zone templates.
 *
 * Pipeline: entity.json → templates → generated workflow files
 */

import fs from "fs/promises";
import path from "path";
import { handlebarsProcessor } from "../templates/shared/handlebarsProcessor.js";
import { CombinedAnalyzer } from "../analyzeEvents/shared/combinedAnalyzer.js";

/**
 * Entity Workflows Generator Class
 */
export class EntityWorkflowsGenerator {
  constructor(options = {}) {
    this.options = {
      templatesPath: options.templatesPath || "/home/paul/wf-monorepo-new/analysis-n-document/genOps/templates/workflow",
      outputPath: options.outputPath || "./output",
      ...options,
    };
  }

  /**
   * Generate workflows for a specific entity
   * @param {string} entityJsonPath - Path to the entity.json file
   * @param {string} appName - App name (plans, admin, client)
   * @returns {Object} Generation results
   */
  async generateEntityWorkflows(entityJsonPath, appName) {
    try {
      console.log(`🔧 Generating workflows for ${appName} entity...`);

      // Load entity data
      const entityData = await this.loadEntityData(entityJsonPath);
      console.log(
        `📊 Loaded entity: ${entityData.name} (${entityData.fields?.length || 0
        } fields)`
      );

      // Generate template context
      const context = this.generateTemplateContext(entityData, appName);

      // Generate workflow file
      const workflowResult = await this.generateWorkflowFile(context, appName);

      // Generate display file
      const displayResult = await this.generateDisplayFile(context, appName);

      console.log(`✅ Generated workflows for ${entityData.name}:`);
      console.log(`   📄 ${workflowResult.filename}`);
      console.log(`   🎨 ${displayResult.filename}`);

      return {
        success: true,
        entity: entityData.name,
        files: [workflowResult, displayResult],
        context,
      };
    } catch (error) {
      console.error(`❌ Failed to generate workflows for ${appName}:`, error);
      return {
        success: false,
        error: error.message,
        entity: null,
        files: [],
      };
    }
  }

  /**
   * Generate workflows for all entities in an app
   * @param {string} appName - App name (plans, admin, client)
   * @returns {Array} Generation results for all entities
   */
  async generateAppWorkflows(appName) {
    try {
      console.log(`🚀 Generating all workflows for ${appName} app using enhanced analysis...`);

      // Run combined analysis to get merged entity data
      const analyzer = new CombinedAnalyzer(appName);
      const analysisResults = await analyzer.runCompleteAnalysis();

      if (!analysisResults.mergedEntities || Object.keys(analysisResults.mergedEntities).length === 0) {
        console.warn(`⚠️  No merged entities found for ${appName}. Using fallback method.`);
        return this.generateAppWorkflowsFallback(appName);
      }

      console.log(`📋 Found ${Object.keys(analysisResults.mergedEntities).length} merged entities: ${Object.keys(analysisResults.mergedEntities).join(", ")}`);

      // Generate workflows for each merged entity
      const results = [];
      for (const [entityName, mergedEntity] of Object.entries(analysisResults.mergedEntities)) {
        const result = await this.generateEntityWorkflowsFromMerged(mergedEntity, appName);
        results.push(result);
      }

      const successful = results.filter((r) => r.success).length;
      console.log(
        `🎉 Generated workflows for ${successful}/${results.length} entities in ${appName} app`
      );

      return results;
    } catch (error) {
      console.error(
        `❌ Failed to generate app workflows for ${appName}:`,
        error
      );
      return [];
    }
  }

  /**
   * Load entity data from JSON file
   */
  async loadEntityData(entityJsonPath) {
    const content = await fs.readFile(entityJsonPath, "utf-8");
    return JSON.parse(content);
  }

  /**
   * Generate template context from entity data
   */
  generateTemplateContext(entityData, appName) {
    return {
      // Basic entity info
      entityName: entityData.name,
      tableName: entityData.tableName || `api_wf.${entityData.name}`,
      primaryKey: entityData.primaryKey || "id",

      // Fields
      fields: entityData.fields || [],

      // App context
      appName,
      schemaSource: `${appName}/${entityData.name}.json`,

      // Metadata
      generationTimestamp: new Date().toISOString(),
      generationSource: "genEntityWorkflows.js",
      schemaVersion: "1.0.0",

      // Permissions
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true,
        export: true,
      },

      // Helper arrays for template logic
      searchableFields: ["name", "title", "description", "label"],
      hiddenInTable: ["id", "created_at", "updated_at", "deleted_at"],
      hiddenInForm: ["id", "created_at", "updated_at", "deleted_at"],
    };
  }

  /**
   * Generate workflow file using template
   */
  async generateWorkflowFile(context, appName) {
    const templatePath = path.join(
      this.options.templatesPath,
      "workflow.hbs"
    );
    const processedContent = await handlebarsProcessor.processTemplate(
      templatePath,
      context
    );

    const outputDir = path.resolve(
      `./analysis-n-document/genOps/workflows/output/${appName}`
    );
    const filename = `${context.entityName}-workflow.js`;
    const outputPath = path.join(outputDir, filename);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Check if file exists and preserve manual zones
    let finalContent = processedContent;
    try {
      const existingContent = await fs.readFile(outputPath, "utf-8");
      finalContent = handlebarsProcessor.preserveManualZones(
        existingContent,
        processedContent
      );
      console.log(`🔄 Preserved manual customizations in ${filename}`);
    } catch (error) {
      // File doesn't exist, use new content
      console.log(`📝 Creating new ${filename}`);
    }

    await fs.writeFile(outputPath, finalContent);

    return {
      filename,
      path: outputPath,
      type: "workflow",
      size: finalContent.length,
    };
  }

  /**
   * Generate display file using template
   */
  async generateDisplayFile(context, appName) {
    const templatePath = path.join(
      this.options.templatesPath,
      "display.hbs"
    );

    const processedContent = await handlebarsProcessor.processTemplate(
      templatePath,
      context
    );

    const outputDir = path.resolve(
      `./analysis-n-document/genOps/workflows/output/${appName}`
    );
    const filename = `${context.entityName}-display.js`;
    const outputPath = path.join(outputDir, filename);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Check if file exists and preserve manual zones
    let finalContent = processedContent;
    try {
      const existingContent = await fs.readFile(outputPath, "utf-8");
      finalContent = handlebarsProcessor.preserveManualZones(
        existingContent,
        processedContent
      );
      console.log(`🔄 Preserved manual customizations in ${filename}`);
    } catch (error) {
      // File doesn't exist, use new content
      console.log(`📝 Creating new ${filename}`);
    }

    await fs.writeFile(outputPath, finalContent);

    return {
      filename,
      path: outputPath,
      type: "display",
      size: finalContent.length,
    };
  }

  /**
   * Find all entity JSON files in a directory
   */
  async findEntityFiles(schemasPath) {
    try {
      const files = await fs.readdir(schemasPath);
      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => path.join(schemasPath, file));
    } catch (error) {
      console.warn(`Could not read schemas directory: ${schemasPath}`);
      return [];
    }
  }

  /**
   * Utility functions for naming conventions
   */
  toCamelCase(str) {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  toPascalCase(str) {
    return str.charAt(0).toUpperCase() + this.toCamelCase(str).slice(1);
  }

  /**
   * Fallback method using original approach
   */
  async generateAppWorkflowsFallback(appName) {
    try {
      // Find all entity.json files for the app
      const schemasPath = path.resolve(
        `./analysis-n-document/genOps/analyzeSchemas/apps/${appName}`
      );
      const entityFiles = await this.findEntityFiles(schemasPath);

      if (entityFiles.length === 0) {
        console.log(`⚠️ No entity files found for ${appName} app`);
        return [];
      }

      console.log(
        `📋 Fallback: Found ${entityFiles.length} entities: ${entityFiles
          .map((f) => path.basename(f, ".json"))
          .join(", ")}`
      );

      // Generate workflows for each entity
      const results = [];
      for (const entityFile of entityFiles) {
        const result = await this.generateEntityWorkflows(entityFile, appName);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error(`❌ Fallback method failed for ${appName}:`, error);
      return [];
    }
  }

  /**
   * Generate workflows from merged entity data
   */
  async generateEntityWorkflowsFromMerged(mergedEntity, appName) {
    try {
      console.log(`🔧 Generating workflows for ${mergedEntity.eventType}...`);

      // Generate template context from merged entity data
      const context = this.generateTemplateContextFromMerged(mergedEntity, appName);

      // Generate workflow file
      const workflowResult = await this.generateWorkflowFile(context, appName);

      // Generate display file
      const displayResult = await this.generateDisplayFile(context, appName);

      console.log(`✅ Generated workflows for ${mergedEntity.eventType}:`);
      console.log(`   📄 ${workflowResult.filename}`);
      console.log(`   🎨 ${displayResult.filename}`);

      return {
        success: true,
        entity: context.entityName,
        files: [workflowResult, displayResult],
        context,
      };
    } catch (error) {
      console.error(`❌ Failed to generate workflows from merged entity:`, error);
      return {
        success: false,
        error: error.message,
        entity: mergedEntity.eventType,
        files: [],
      };
    }
  }

  /**
   * Generate template context from merged entity data
   */
  generateTemplateContextFromMerged(mergedEntity, appName) {
    // Extract entity name from eventType, handling different categories
    let entityName = mergedEntity.eventType;
    //    if (mergedEntity.category === 'select') {
    //      // For select types, use the eventType as is
    //      entityName = mergedEntity.eventType.replace(/^select/, '').toLowerCase();
    //    } else {
    //      // For form/grid types, remove category prefix and "Dtl" suffix
    //      const categoryPrefix = mergedEntity.category || 'form';
    //      entityName = mergedEntity.eventType.replace(new RegExp(`^${categoryPrefix}`, 'i'), '').replace(/Dtl$/, '').toLowerCase();
    //    }

    // Generate unique filename with category
    //    const workflowName = mergedEntity.category === 'select'
    //      ? `${entityName}-select`
    //      : `${entityName}-${mergedEntity.category}`;

    return {
      // Basic entity info
      entityName: entityName,
      baseEntityName: entityName,
      category: mergedEntity.category,
      tableName: mergedEntity.dbTable,
      primaryKey: mergedEntity.primaryKey,

      // Filtered fields with full metadata
      fields: mergedEntity.fields || [],

      // Event-specific metadata
      eventType: mergedEntity.eventType,
      workflows: mergedEntity.workflows || [],
      navChildren: mergedEntity.navChildren || [],

      // Supported CRUD operations
      supportedOperations: mergedEntity.supportedOperations || {
        create: true, read: true, update: true, delete: true
      },

      // App context
      appName,
      schemaSource: `${appName}/${entityName}.eventType`,

      // Metadata
      generationTimestamp: new Date().toISOString(),
      generationSource: "genEntityWorkflows.js (enhanced-multi-category)",
      schemaVersion: "2.1.0",

      // Permissions based on supported operations
      permissions: {
        create: mergedEntity.supportedOperations?.create || false,
        read: mergedEntity.supportedOperations?.read || false,
        update: mergedEntity.supportedOperations?.update || false,
        delete: mergedEntity.supportedOperations?.delete || false,
        export: mergedEntity.supportedOperations?.read || false,
      },

      // Helper arrays for template logic
      searchableFields: ["name", "title", "description", "label", "subject"],
      hiddenInTable: ["id", "created_at", "updated_at", "deleted_at"],
      hiddenInForm: ["id", "created_at", "updated_at", "deleted_at"],

      // Statistics
      totalSchemaFields: mergedEntity.totalSchemaFields,
      totalEventFields: mergedEntity.totalEventFields,
      filteredFields: mergedEntity.filteredFields,

      // Select-specific data (for select eventTypes)
      method: mergedEntity.method,
      configSource: mergedEntity.configSource
    };
  }
}

/**
 * CLI interface for the generator
 */
export async function generateWorkflows(appName = null) {
  const generator = new EntityWorkflowsGenerator();

  if (appName) {
    // Generate for specific app
    return await generator.generateAppWorkflows(appName);
  } else {
    // Generate for all apps
    const apps = ["plans", "admin", "client"];
    const allResults = [];

    for (const app of apps) {
      console.log(`\n🎯 Processing ${app} app...`);
      const results = await generator.generateAppWorkflows(app);
      allResults.push(...results);
    }

    return allResults;
  }
}

export default EntityWorkflowsGenerator;
