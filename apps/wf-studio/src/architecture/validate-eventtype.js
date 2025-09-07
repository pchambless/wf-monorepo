/**
 * 🔍 EventType Standards Validator
 * 
 * On-demand validation of eventTypes against grid standards
 * Usage: validateEventType(eventTypeObject)
 */

import { validatePosition, validateContainer, isValidPosition } from './grid-standards.js';

/**
 * Validate an eventType against grid standards
 */
export function validateEventType(eventType, filePath = 'unknown') {
  const violations = [];
  const warnings = [];
  
  // 1. Check if eventType has required structure
  if (!eventType || typeof eventType !== 'object') {
    violations.push('EventType must be an object');
    return { valid: false, violations, warnings };
  }

  // 2. Check container type (if present)
  if (eventType.container) {
    try {
      validateContainer(eventType.container);
    } catch (error) {
      violations.push(`Invalid container: ${error.message}`);
    }
  } else if (eventType.components && eventType.components.length > 0) {
    warnings.push('EventType has components but no container type specified');
  }

  // 3. Check position (if present)
  if (eventType.position) {
    if (!isValidPosition(eventType.position)) {
      violations.push('Invalid position structure');
    }
  } else if (eventType.container && eventType.container !== 'page') {
    warnings.push('EventType has container but no position specified');
  }

  // 4. Check components recursively
  if (eventType.components && Array.isArray(eventType.components)) {
    eventType.components.forEach((component, index) => {
      const componentResult = validateEventType(component, `${filePath} > component[${index}]`);
      
      // Merge violations with component path context
      componentResult.violations.forEach(violation => {
        violations.push(`Component[${index}]: ${violation}`);
      });
      
      componentResult.warnings.forEach(warning => {
        warnings.push(`Component[${index}]: ${warning}`);
      });
    });
  }

  // 5. Check for old-style positioning
  if (eventType.width || eventType.position === 'left' || eventType.position === 'right') {
    warnings.push('Uses old-style positioning (width/left/right) - consider updating to grid position');
  }

  return {
    valid: violations.length === 0,
    violations,
    warnings,
    summary: `${violations.length} violations, ${warnings.length} warnings`
  };
}

/**
 * Validate eventType from file path
 */
export async function validateEventTypeFile(filePath) {
  try {
    const module = await import(filePath);
    
    // Try to find the eventType export (could be named various ways)
    const eventType = module.default || 
                     module[Object.keys(module).find(key => key.includes('Page') || key.includes('Card') || key.includes('Tab'))] ||
                     module[Object.keys(module)[0]];
    
    if (!eventType) {
      return {
        valid: false,
        violations: ['No eventType export found in file'],
        warnings: [],
        summary: '1 violation, 0 warnings'
      };
    }

    return validateEventType(eventType, filePath);
    
  } catch (error) {
    return {
      valid: false,
      violations: [`Failed to load file: ${error.message}`],
      warnings: [],
      summary: '1 violation, 0 warnings'
    };
  }
}

/**
 * Format validation results for console output
 */
export function formatValidationResults(results, filePath) {
  let output = `\n📋 Validation Results: ${filePath}\n`;
  output += `${results.valid ? '✅' : '❌'} ${results.summary}\n`;
  
  if (results.violations.length > 0) {
    output += '\n🚨 Standards Violations:\n';
    results.violations.forEach((violation, index) => {
      output += `  ${index + 1}. ${violation}\n`;
    });
  }
  
  if (results.warnings.length > 0) {
    output += '\n⚠️  Warnings:\n';
    results.warnings.forEach((warning, index) => {
      output += `  ${index + 1}. ${warning}\n`;
    });
  }
  
  return output;
}