import { createLogger } from '../../utils/logger.js';

const log = createLogger('colPosParser', 'debug');

/**
 * Parse colPos string into component configuration
 * Format: "row,col,colSpan,componentName"
 *
 * Examples:
 *   "1,1,2,text" → row=1, col=1, colSpan=2, type='text'
 *   "2,1,1,SelBrand" → row=2, col=1, colSpan=1, type='select', qryName='SelBrand'
 *   "1,1,2,H4" → row=1, col=1, colSpan=2, renderAsText=true, comp_type='h4'
 *
 * @param {string} colPos - Position string
 * @param {object} eventTypeRegistry - Map of eventType name → { category, config }
 * @returns {object} Parsed configuration
 */
export const parseColPos = (colPos, eventTypeRegistry = {}) => {
  if (!colPos) return {};

  const [row, col, colSpan, componentName] = colPos.split(',').map(s => s?.trim());

  const result = {
    row: parseInt(row) || undefined,
    col: parseInt(col) || undefined,
    colSpan: parseInt(colSpan) || undefined
  };

  if (componentName) {
    const eventType = eventTypeRegistry[componentName];

    if (eventType) {
      log.debug(`colPos: ${componentName} → category: ${eventType.category}`);

      switch(eventType.category) {
        case 'select':
          // Select eventTypes (SelBrand, SelVendor, SelMeasure, etc.)
          result.type = 'select';

          // Extract all config from eventType
          if (eventType.config) {
            try {
              const config = typeof eventType.config === 'string'
                ? JSON.parse(eventType.config)
                : eventType.config;

              // Pull everything from config - no duplication needed!
              result.qryName = config.qryName || componentName;
              result.valueKey = config.valueKey || 'value';
              result.labelKey = config.labelKey || 'label';
              result.placeholder = config.placeholder;
              result.contextKey = config.contextKey; // Default context key from eventType
              result.eventTypeConfig = config;
            } catch (e) {
              log.warn(`Failed to parse eventType config for ${componentName}:`, e);
              // Fallback
              result.qryName = componentName;
            }
          } else {
            // No config - use componentName as qryName
            result.qryName = componentName;
          }
          break;

        case 'text':
          // Special case: MultiLine is category='text' but should render as textarea input
          if (componentName === 'MultiLine') {
            result.type = 'textarea';
            if (eventType.config) {
              result.textareaConfig = typeof eventType.config === 'string'
                ? JSON.parse(eventType.config)
                : eventType.config;
            }
          } else {
            // Text display eventTypes (H1, H2, H3, H4, Text, Label)
            result.renderAsText = true;
            result.comp_type = componentName.toLowerCase();
          }
          break;

        case 'component':
          // Other components (Button, Chart, etc.)
          result.comp_type = componentName;
          break;

        default:
          if (eventType.category !== undefined) {
            log.warn(`Unknown category '${eventType.category}' for ${componentName}`);
          }
          result.comp_type = componentName;
      }
    } else {
      // No eventType match - treat as input type (text, textarea, number, email, date)
      result.type = componentName.toLowerCase();
      log.debug(`colPos: ${componentName} → input type: ${result.type}`);
    }
  }

  return result;
};

/**
 * Build eventType registry from eventTypeConfig
 * @param {object} eventTypeConfig - EventType configuration object
 * @returns {object} Map of name → { category, config }
 */
export const buildEventTypeRegistry = (eventTypeConfig) => {
  const registry = {};

  if (!eventTypeConfig || typeof eventTypeConfig !== 'object') {
    return registry;
  }

  Object.entries(eventTypeConfig).forEach(([name, config]) => {
    // Only add entries that have valid category
    if (config && config.category) {
      registry[name] = {
        category: config.category,
        config: config.config
      };
    }
  });

  log.debug(`Built eventType registry with ${Object.keys(registry).length} entries`);
  return registry;
};
