/**
 * Hierarchy Resolver - Handles recursive component hierarchy resolution
 */

import { loadEventTypeFromFile } from './astParser.js';
import { buildEventTypeRegistry } from './registryBuilder.js';
import { validateEventTypeAgainstTemplate } from '../templateRegistry.js';
import logger from "../logger.js";

const codeName = "[hierarchyResolver.js]";

/**
 * Recursively resolve component hierarchy using registry
 */
export async function resolveComponentHierarchy(rootEventType, basePath) {
  const allEventTypes = new Map();
  allEventTypes.set(rootEventType.eventType, rootEventType);
  
  // Build registry of all available eventTypes
  const registry = await buildEventTypeRegistry(basePath);
  
  async function resolveComponent(component, parentEventType = 'unknown') {
    const componentId = component.id || component;
    
    if (allEventTypes.has(componentId)) {
      // If it's just a string reference, return the eventType
      if (typeof component === 'string') {
        return allEventTypes.get(componentId);
      }
      // If it's an object with layout info, merge with eventType
      return { ...allEventTypes.get(componentId), ...component };
    }
    
    // Look up component in registry
    const eventTypePath = registry.get(componentId);
    if (eventTypePath) {
      try {
        const eventType = await loadEventTypeFromFile(eventTypePath);
        allEventTypes.set(eventType.eventType, eventType);
        
        // Validate component eventType against its template (if available)
        if (eventType.category) {
          const validation = await validateEventTypeAgainstTemplate(eventType);
          if (validation.template) {
            logger.debug(`${codeName} Component validation - ${componentId}: Template: ${validation.template}, Cards: [${validation.cards?.join(', ') || 'none'}]`);
            if (validation.warnings?.length > 0) {
              logger.warn(`${codeName} Component ${componentId} warnings: ${validation.warnings.join(', ')}`);
            }
          }
        }
        
        // Merge inline component config with eventType definition
        let mergedComponent;
        if (typeof component === 'object' && component.id) {
          // Component has layout/container info - merge it with eventType
          mergedComponent = {
            ...eventType,        // eventType definition (behavior, category, etc.)
            ...component,        // inline layout config (container, position, props)
            eventType: eventType.eventType || componentId  // preserve eventType name
          };
        } else {
          // Just a string reference - use eventType as-is
          mergedComponent = eventType;
        }
        
        // Recursively resolve nested components
        if (eventType.components && Array.isArray(eventType.components)) {
          const resolvedComponents = [];
          for (const child of eventType.components) {
            const resolved = await resolveComponent(child, eventType.eventType || componentId);
            resolvedComponents.push(resolved);
          }
          mergedComponent.components = resolvedComponents;
        }
        
        return mergedComponent;
      } catch (error) {
        logger.warn(`${codeName} Could not parse eventType from ${eventTypePath}: ${error.message}`);
      }
    }
    
    // Component not found in registry - might be an inline component definition
    if (typeof component === 'object' && component.id) {
      logger.debug(`${codeName} Using inline component definition for: ${componentId} (from ${parentEventType})`);
      return component;
    }
    
    logger.warn(`${codeName} Could not resolve component: ${componentId} (referenced by ${parentEventType})`);
    return component;
  }
  
  // Resolve root component's children
  if (rootEventType.components && Array.isArray(rootEventType.components)) {
    const resolvedComponents = [];
    for (const component of rootEventType.components) {
      const resolved = await resolveComponent(component, rootEventType.eventType || 'pageStudio');
      resolvedComponents.push(resolved);
    }
    rootEventType.components = resolvedComponents;
  }
  
  return { resolvedEventType: rootEventType, allEventTypes };
}