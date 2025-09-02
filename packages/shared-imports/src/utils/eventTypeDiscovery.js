import fs from 'fs/promises';
import path from 'path';
import { parse } from '@babel/parser';

/**
 * Parse eventType file using Babel AST for robust component extraction
 * Enhanced version for Studio eventType analysis with fields support
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
                // Parse components array for container eventTypes
                const components = [];
                const componentReferences = [];

                for (const comp of value.elements) {
                  if (comp.type === 'ObjectExpression') {
                    const componentObj = extractObjectProperties(comp);
                    components.push(componentObj);

                    // Create component reference for dependency resolution
                    if (componentObj.id) {
                      componentReferences.push({
                        id: componentObj.id,
                        ...(componentObj.container && { container: componentObj.container }),
                        ...(componentObj.position && { position: componentObj.position })
                      });
                    }
                  }
                }

                eventTypeData.components = components;
                eventTypeData.componentReferences = componentReferences;

              } else if (key === 'fields' && value.type === 'ArrayExpression') {
                // Parse fields array for leaf eventTypes (NEW for Studio)
                const fields = [];

                for (const field of value.elements) {
                  if (field.type === 'ObjectExpression') {
                    const fieldObj = extractObjectProperties(field);
                    fields.push(fieldObj);
                  }
                }

                eventTypeData.fields = fields;

              } else if (key === 'fieldOverrides' && value.type === 'ArrayExpression') {
                // Parse field overrides array (NEW for Studio)
                const fieldOverrides = [];

                for (const override of value.elements) {
                  if (override.type === 'ObjectExpression') {
                    const overrideObj = extractObjectProperties(override);
                    fieldOverrides.push(overrideObj);
                  }
                }

                eventTypeData.fieldOverrides = fieldOverrides;

              } else if (key === 'actions' && value.type === 'ArrayExpression') {
                // Parse actions array (NEW for Studio)
                const actions = [];

                for (const action of value.elements) {
                  if (action.type === 'ObjectExpression') {
                    const actionObj = extractObjectProperties(action);
                    actions.push(actionObj);
                  }
                }

                eventTypeData.actions = actions;

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
                eventTypeData.validation = extractObjectProperties(value);

              } else if (value.type === 'StringLiteral') {
                eventTypeData[key] = value.value;
              } else if (value.type === 'NumericLiteral') {
                eventTypeData[key] = value.value;
              } else if (value.type === 'BooleanLiteral') {
                eventTypeData[key] = value.value;
              } else if (value.type === 'ArrayExpression') {
                // Handle simple string arrays
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
 * Recursively extract properties from an ObjectExpression AST node
 * Handles nested objects, arrays, and primitive values
 */
function extractObjectProperties(objectNode) {
  const result = {};

  for (const prop of objectNode.properties) {
    const key = prop.key.name || prop.key.value;
    const value = prop.value;

    if (value.type === 'StringLiteral') {
      result[key] = value.value;
    } else if (value.type === 'NumericLiteral') {
      result[key] = value.value;
    } else if (value.type === 'BooleanLiteral') {
      result[key] = value.value;
    } else if (value.type === 'ObjectExpression') {
      // Recursively handle nested objects
      result[key] = extractObjectProperties(value);
    } else if (value.type === 'ArrayExpression') {
      // Handle arrays
      const arrayValues = [];
      for (const element of value.elements) {
        if (element.type === 'StringLiteral') {
          arrayValues.push(element.value);
        } else if (element.type === 'NumericLiteral') {
          arrayValues.push(element.value);
        } else if (element.type === 'ObjectExpression') {
          arrayValues.push(extractObjectProperties(element));
        }
      }
      result[key] = arrayValues;
    }
  }

  return result;
}

/**
 * Scan directory for eventType files and resolve component dependencies
 * Returns both eventTypes and a dependency map for page config generation
 */
export async function discoverEventTypes(baseDir) {
  const eventTypes = {};
  const dependencies = {};

  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js') && entry.name !== 'index.js') {
          const parsedEventTypes = await parseEventTypeFile(fullPath);

          for (const eventTypeData of parsedEventTypes) {
            const eventTypeName = eventTypeData.eventType;
            eventTypes[eventTypeName] = eventTypeData;

            // Build dependency map for page config generation
            if (eventTypeData.componentReferences) {
              dependencies[eventTypeName] = eventTypeData.componentReferences.map(ref => ref.id);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[discoverEventTypes] Error scanning directory ${dir}:`, error.message);
    }
  }

  await scanDirectory(baseDir);

  return {
    eventTypes,
    dependencies,
    stats: {
      totalEventTypes: Object.keys(eventTypes).length,
      leafEventTypes: Object.values(eventTypes).filter(et => et.fields).length,
      containerEventTypes: Object.values(eventTypes).filter(et => et.components).length
    }
  };
}

export default {
  parseEventTypeFile,
  discoverEventTypes
};