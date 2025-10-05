/**
 * AST Parser - Handles JavaScript file parsing and object extraction
 */

import { promises as fs } from 'fs';
import { parse } from '@babel/parser';
import logger from "../logger.js";

const codeName = "[astParser.js]";

/**
 * Load eventType from JavaScript file using Babel parser
 */
export async function loadEventTypeFromFile(filePath) {
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
              const eventType = astToObject(declarator.init);
              eventType.filePath = filePath;
              return eventType;
            }
          }
        }
      }
    }
    
    throw new Error(`No valid eventType export found in ${filePath}`);
  } catch (error) {
    logger.warn(`${codeName} Could not load eventType from ${filePath}: ${error.message}`);
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