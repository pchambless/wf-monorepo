/**
 * Template Registry - Maps eventType categories to templates and their cards
 * Used by genPageConfig to validate/enhance eventTypes using template definitions
 */

import { promises as fs } from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import logger from "./logger.js";

const codeName = "[templateRegistry.js]";
const TEMPLATES_PATH = "/home/paul/wf-monorepo-new/apps/wf-studio/src/eventBuilders/templates";

/**
 * Load template from JavaScript file using same AST parser as genPageConfig
 */
async function loadTemplateFromFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx']
    });
    
    const body = ast?.program?.body || ast?.body || [];
    if (!Array.isArray(body)) {
      throw new Error(`Invalid AST structure in ${filePath}`);
    }
    
    for (const node of body) {
      if (node.type === 'ExportNamedDeclaration' && node.declaration) {
        if (node.declaration.type === 'VariableDeclaration') {
          for (const declarator of node.declaration.declarations) {
            if (declarator.init && declarator.init.type === 'ObjectExpression') {
              const template = astToObject(declarator.init);
              template.filePath = filePath;
              return template;
            }
          }
        }
      }
    }
    
    throw new Error(`No valid template export found in ${filePath}`);
  } catch (error) {
    logger.warn(`${codeName} Could not load template from ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Convert Babel AST ObjectExpression to JavaScript object (same as genPageConfig)
 */
function astToObject(node) {
  if (node.type === 'ObjectExpression') {
    const obj = {};
    for (const prop of node.properties) {
      if (prop.type === 'ObjectProperty') {
        const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
        obj[key] = astToValue(prop.value);
      }
    }
    return obj;
  }
  return null;
}

/**
 * Convert Babel AST node to JavaScript value (same as genPageConfig)  
 */
function astToValue(node) {
  switch (node.type) {
    case 'StringLiteral':
      return node.value;
    case 'NumericLiteral':
      return node.value;
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'ObjectExpression':
      return astToObject(node);
    case 'ArrayExpression':
      return node.elements.map(element => astToValue(element));
    case 'Identifier':
      return node.name;
    default:
      return null;
  }
}

// Cache the registry to avoid rebuilding on every call  
let cachedRegistry = null;
let cacheTimestamp = null;

/**
 * Build template registry using discoverTemplates (orchestration!)
 * Returns Map: category -> template definition
 */
async function buildTemplateRegistry() {
  if (cachedRegistry) {
    logger.debug(`${codeName} Using cached template registry (${cacheTimestamp}) with ${cachedRegistry.size} templates`);
    return cachedRegistry;
  }
  
  const registry = new Map();
  
  // Use discoverTemplates for consolidated template discovery (orchestration!)
  const templateData = await execTemplates();
  logger.debug(`${codeName} Building registry from ${templateData.length} discovered templates`);
  
  // Build registry from discovered template data (already parsed by discoverTemplates!)
  for (const template of templateData) {
    if (template.category) {
      registry.set(template.category, template);
      logger.debug(`${codeName} Registry: ${template.category} -> ${template.name} (cards: ${template.detailCards?.join(',') || 'none'})`);
    }
  }
  cacheTimestamp = new Date().toISOString();
  logger.debug(`${codeName} Built template registry (${cacheTimestamp}) with ${registry.size} templates`);
  
  // Cache the registry for future calls
  cachedRegistry = registry;
  return registry;
}

/**
 * Get template for eventType category
 * @param {string} category - EventType category (form, grid, column, tabs, etc.)
 * @returns {Object|null} Template definition or null if not found
 */
export async function getTemplateForCategory(category) {
  const registry = await buildTemplateRegistry();
  const template = registry.get(category);
  
  if (!template) {
    logger.warn(`${codeName} No template found for category: ${category}`);
    return null;
  }
  
  logger.debug(`${codeName} Found template for ${category}: ${template.detailCards?.length || 0} cards`);
  return template;
}

/**
 * Get all available templates
 * @returns {Map} Full template registry
 */
export async function getAllTemplates() {
  return await buildTemplateRegistry();
}

/**
 * Clear the template registry cache - useful for development
 * Forces fresh template discovery on next call
 */
export function clearTemplateCache() {
  cachedRegistry = null;
  cacheTimestamp = null;
  logger.debug(`${codeName} Template cache cleared`);
}

/**
 * Validate eventType against its template definition
 * @param {Object} eventType - EventType to validate
 * @returns {Object} Validation result with errors/warnings
 */
export async function validateEventTypeAgainstTemplate(eventType) {
  const template = await getTemplateForCategory(eventType.category);
  
  if (!template) {
    return {
      valid: false,
      errors: [`No template found for category: ${eventType.category}`]
    };
  }
  
  // For now, just check that eventType has the basic structure
  const errors = [];
  const warnings = [];
  
  if (!eventType.title) warnings.push('Missing title field');
  if (!eventType.cluster) warnings.push('Missing cluster field');
  if (!eventType.purpose) warnings.push('Missing purpose field');
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    template: template.category,
    cards: template.detailCards
  };
}

/**
 * Internal execTemplates function - calls discoverTemplates internally (server-side orchestration)
 */
async function execTemplates() {
  try {
    // Create a mock req/res for internal call to discoverTemplates
    const mockReq = {};
    let responseData = null;
    
    const mockRes = {
      json: (data) => { responseData = data; },
      status: () => mockRes
    };
    
    // Import and call discoverTemplates internally
    const { discoverTemplates } = await import('../controller/studioDiscovery/discoverTemplates.js');
    await discoverTemplates(mockReq, mockRes);
    
    // Return the flat array of templates for registry building
    if (responseData?.success && responseData.rows) {
      return responseData.rows; // Already a flat array from enhanced discoverTemplates
    }
    
    logger.warn(`${codeName} Failed to get templates from discoverTemplates`);
    return [];
  } catch (error) {
    logger.error(`${codeName} Error in execTemplates:`, error);
    return [];
  }
}