/**
 * Logger utility for structured logging with module identification
 * Provides colored console output, timestamps, and filterable logs
 * 
 * Usage:
 * import { createLogger } from './utils/logger.js';
 * const log = createLogger('ComponentName', 'info');
 * log.info('Message here');
 * log.debug('Debug details', data);
 */

// Global configuration for logger
let loggerConfig = {
  defaultLevel: 'info',
  colors: {
    component: '#10b981', // Green for component names
    debug: '#6b7280',     // Grey for debug
    info: '#3b82f6',      // Blue for info 
    warn: '#f59e0b',      // Orange for warnings
    error: '#ef4444'      // Red for errors
  }
};

// Define log level hierarchy
const LOG_LEVELS = {
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};

/**
 * Create a logger instance for a specific component/module
 * @param {string} component - Name of the component/module
 * @param {string} level - Log level (error, warn, info, debug)
 * @returns {Function} Logger function with debug/info/warn/error methods
 */
export const createLogger = (component, level = null) => {
  const logLevel = level || loggerConfig.defaultLevel;
  
  // Check if a message should be logged based on current level
  const shouldLog = (messageLevel) => {
    return LOG_LEVELS[messageLevel] <= LOG_LEVELS[logLevel];
  };
  
  // Generate timestamp
  const timestamp = () => {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${
      now.getMinutes().toString().padStart(2, '0')}:${
      now.getSeconds().toString().padStart(2, '0')}.${
      now.getMilliseconds().toString().padStart(3, '0')}]`;
  };
  
  // Format log messages with color
  const formatMessage = (level, message) => {
    return [
      `%c[${component}] %c${level.toUpperCase()}: %c${message}`,
      `color: ${loggerConfig.colors.component}; font-weight: bold`, // Component in green + bold
      `color: ${loggerConfig.colors[level]}; font-weight: bold`, // Level with appropriate color
      `color: inherit` // Message in default color
    ];
  };
  
  // Create logger object with all methods
  const logger = {
    debug: (message, ...args) => {
      if (shouldLog('debug')) {
        const [formattedMsg, ...styles] = formatMessage('debug', message);
        console.debug(formattedMsg, ...styles, ...args);
      }
    },
    info: (message, ...args) => {
      if (shouldLog('info')) {
        const [formattedMsg, ...styles] = formatMessage('info', message);
        console.info(formattedMsg, ...styles, ...args);
      }
    },
    warn: (message, ...args) => {
      if (shouldLog('warn')) {
        const [formattedMsg, ...styles] = formatMessage('warn', message);
        console.warn(formattedMsg, ...styles, ...args);
      }
    },
    error: (message, ...args) => {
      if (shouldLog('error')) {
        const [formattedMsg, ...styles] = formatMessage('error', message);
        console.error(formattedMsg, ...styles, ...args);
      }
    },
    // Add console grouping methods
    group: (label) => {
      if (shouldLog('debug')) {
        const [formattedMsg, ...styles] = formatMessage('debug', label);
        console.group(formattedMsg, ...styles);
      }
    },
    groupCollapsed: (label) => {
      if (shouldLog('debug')) {
        const [formattedMsg, ...styles] = formatMessage('debug', label);
        console.groupCollapsed(formattedMsg, ...styles);
      }
    },
    groupEnd: () => {
      if (shouldLog('debug')) console.groupEnd();
    }
  };
  
  // Create a function that acts like logger.info when called directly
  const loggerFunction = (message, ...args) => {
    logger.info(message, ...args);
  };
  
  // Copy all methods from logger object to the function
  Object.assign(loggerFunction, logger);
  
  // Return the enhanced function
  return loggerFunction;
}

/**
 * Configure global logger settings
 * @param {Object} newConfig - New configuration to merge
 */
export const configureLogger = (newConfig) => {
  loggerConfig = { ...loggerConfig, ...newConfig };
};

/**
 * Get current logger configuration
 */
export const getLoggerConfig = () => ({ ...loggerConfig });

/**
 * Convenience loggers for common use cases
 */
export const systemLogger = createLogger('SYSTEM', 'info');
export const debugLogger = createLogger('DEBUG', 'debug');
export const errorLogger = createLogger('ERROR', 'error');