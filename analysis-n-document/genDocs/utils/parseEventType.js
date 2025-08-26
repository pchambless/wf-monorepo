import fs from 'fs/promises';
import path from 'path';
import { parse } from '@babel/parser';
import { getAppDirectory } from '../../config/appNames.js';

/**
 * Parse eventType file using Babel AST for robust component extraction
 * Replaces regex-based parsing with proper AST traversal
 */
export async function parseEventTypeFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');

    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx']
    });

    const result = [];

    for (const node of ast.program.body) {
      if (
        node.type === 'ExportNamedDeclaration' &&
        node.declaration?.type === 'VariableDeclaration'
      ) {
        for (const decl of node.declaration.declarations) {
          const name = decl.id.name;
          const init = decl.init;

          if (init?.type === 'ObjectExpression') {
            const eventTypeData = {
              eventType: name,
              filePath: filePath
            };

            // Extract properties from the object
            for (const prop of init.properties) {
              const key = prop.key.name;
              const value = prop.value;

              if (key === 'components' && value.type === 'ArrayExpression') {
                // Parse components array
                const components = [];
                const componentReferences = [];

                for (const comp of value.elements) {
                  if (comp.type === 'ObjectExpression') {
                    const componentObj = {};

                    for (const compProp of comp.properties) {
                      const compKey = compProp.key.name;
                      const compVal = compProp.value;

                      if (compVal.type === 'StringLiteral') {
                        componentObj[compKey] = compVal.value;
                      } else if (compVal.type === 'ObjectExpression') {
                        // Handle nested objects (position, span, props, etc.)
                        const nestedObj = {};
                        for (const nestedProp of compVal.properties) {
                          const nestedKey = nestedProp.key.name;
                          const nestedVal = nestedProp.value;

                          if (nestedVal.type === 'StringLiteral') {
                            nestedObj[nestedKey] = nestedVal.value;
                          } else if (nestedVal.type === 'NumericLiteral') {
                            nestedObj[nestedKey] = nestedVal.value;
                          }
                        }
                        componentObj[compKey] = nestedObj;
                      } else if (compVal.type === 'NumericLiteral') {
                        componentObj[compKey] = compVal.value;
                      }
                    }

                    components.push(componentObj);

                    // Create component reference for edges
                    if (componentObj.id) {
                      componentReferences.push({
                        id: componentObj.id,
                        ...(componentObj.container && { container: componentObj.container })
                      });
                    }
                  }
                }

                eventTypeData.components = components;
                eventTypeData.componentReferences = componentReferences;

              } else if (key === 'workflowTriggers' && value.type === 'ObjectExpression') {
                // Parse workflowTriggers object
                const workflowTriggers = {};

                for (const triggerProp of value.properties) {
                  const triggerKey = triggerProp.key.name;
                  const triggerVal = triggerProp.value;

                  if (triggerVal.type === 'ArrayExpression') {
                    const workflows = [];
                    for (const workflowElement of triggerVal.elements) {
                      if (workflowElement.type === 'StringLiteral') {
                        workflows.push(workflowElement.value);
                      }
                    }
                    workflowTriggers[triggerKey] = workflows;
                  }
                }

                eventTypeData.workflowTriggers = workflowTriggers;

              } else if (key === 'validation' && value.type === 'ObjectExpression') {
                // Parse validation object
                const validation = {};
                for (const validationProp of value.properties) {
                  const validationKey = validationProp.key.name;
                  const validationVal = validationProp.value;

                  if (validationVal.type === 'ObjectExpression') {
                    const fieldValidation = {};
                    for (const fieldProp of validationVal.properties) {
                      const fieldKey = fieldProp.key.name;
                      const fieldVal = fieldProp.value;

                      if (fieldVal.type === 'BooleanLiteral') {
                        fieldValidation[fieldKey] = fieldVal.value;
                      } else if (fieldVal.type === 'NumericLiteral') {
                        fieldValidation[fieldKey] = fieldVal.value;
                      } else if (fieldVal.type === 'StringLiteral') {
                        fieldValidation[fieldKey] = fieldVal.value;
                      }
                    }
                    validation[validationKey] = fieldValidation;
                  }
                }
                eventTypeData.validation = validation;

              } else if (value.type === 'StringLiteral') {
                // Handle string properties
                eventTypeData[key] = value.value;
              } else if (value.type === 'NumericLiteral') {
                // Handle numeric properties  
                eventTypeData[key] = value.value;
              } else if (value.type === 'BooleanLiteral') {
                // Handle boolean properties
                eventTypeData[key] = value.value;
              } else if (value.type === 'ArrayExpression') {
                // Handle array properties (workflows, etc.)
                const arrayValues = [];
                for (const element of value.elements) {
                  if (element.type === 'StringLiteral') {
                    arrayValues.push(element.value);
                  }
                }
                eventTypeData[key] = arrayValues;
              }
            }

            result.push(eventTypeData);
          }
        }
      }
    }

    return result;

  } catch (error) {
    console.error(`[parseEventTypeFile] Error parsing ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Recursively scan directory for eventType files using Babel parser
 * Supports nested folder structures (forms/, grids/, tabs/, widgets/, etc.)
 */
export async function scanEventTypesWithBabel(baseDir) {
  const results = [];

  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js') && entry.name !== 'index.js') {
          // Parse JavaScript files
          const eventTypes = await parseEventTypeFile(fullPath);

          // Add metadata for each eventType found
          for (const eventType of eventTypes) {
            // Extract folder structure for grouping
            const relativePath = path.relative(baseDir, fullPath);
            const pathParts = relativePath.split(path.sep);
            const plansDir = getAppDirectory('plans');

            results.push({
              ...eventType,
              filePath: `apps/${plansDir}/src/${relativePath}`,
              pageFolder: pathParts[0] || 'unknown', // e.g., 'PlanManager'
              componentType: pathParts[1] || 'misc', // e.g., 'forms', 'grids', 'tabs'
              fileName: entry.name
            });
          }
        }
      }
    } catch (error) {
      console.warn(`[scanEventTypesWithBabel] Error scanning directory ${dir}:`, error.message);
    }
  }

  await scanDirectory(baseDir);
  return results;
}