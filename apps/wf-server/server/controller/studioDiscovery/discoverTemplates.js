/**
 * Studio Discovery - Templates Module
 * Discovers all available templates from eventBuilders/templates
 */

import { promises as fs } from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import logger from "../../utils/logger.js";

const codeName = "[discoverTemplates.js]";
const TEMPLATES_PATH = "/home/paul/wf-monorepo-new/apps/wf-studio/src/eventBuilders/templates";

/**
 * Discover all available templates from eventBuilders/templates
 * GET /api/studio/template
 */
export async function discoverTemplates(req, res) {
  try {
    logger.debug(`${codeName} Discovering templates from eventBuilders/templates`);

    const templates = {};

    // Scan templates directory structure
    async function scanTemplatesDirectory(dirPath, category = '') {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            // Recursively scan subdirectories (containers, leafs, etc.)
            await scanTemplatesDirectory(fullPath, entry.name);
          } else if (entry.isFile() && entry.name.endsWith('.js')) {
            const templateName = path.basename(entry.name, '.js');

            if (!templates[category]) {
              templates[category] = [];
            }

            // Parse template file to get full template definition (including detailCards!)
            try {
              const templateData = await loadTemplateFromFile(fullPath);
              if (templateData) {
                templates[category].push({
                  name: templateName,
                  filePath: fullPath.replace('/home/paul/wf-monorepo-new/', ''),
                  category: category,
                  ...templateData, // Include all parsed template data (detailCards, etc.)
                });
                logger.debug(`${codeName} template: ${templateName} -> cards: ${templateData.detailCards?.join(',') || 'none'}`);
              } else {
                logger.debug(`${codeName} No valid template data in: ${templateName}`);
              }
            } catch (parseError) {
              logger.warn(`${codeName} Could not parse template ${templateName}: ${parseError.message}`);
              // Still include basic metadata even if parsing fails
              templates[category].push({
                name: templateName,
                filePath: fullPath.replace('/home/paul/wf-monorepo-new/', ''),
                category: category,
                parseError: parseError.message
              });
            }
          }
        }
      } catch (scanError) {
        logger.warn(`${codeName} Could not scan templates directory ${dirPath}: ${scanError.message}`);
      }
    }

    await scanTemplatesDirectory(TEMPLATES_PATH);

    const totalTemplates = Object.values(templates).flat().length;
    logger.debug(`${codeName} Found ${totalTemplates} templates across ${Object.keys(templates).length} categories`);

    res.json({
      success: true,
      rows: Object.values(templates).flat(),
      meta: {
        categoriesCount: Object.keys(templates).length,
        totalTemplates: totalTemplates,
        generated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error(`${codeName} Error discovering templates:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to discover templates",
      error: error.message
    });
  }
}

/**
 * Load template from JavaScript file using AST parser (same as templateRegistry)
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
    logger.debug(`${codeName} Could not load template from ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Convert Babel AST ObjectExpression to JavaScript object
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
 * Convert Babel AST node to JavaScript value
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