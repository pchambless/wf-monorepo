// Simple configuration for logger
let loggerConfig = {
  showTimestamps: true,
  defaultLevel: 3, // info
  colors: {
    debug: '#6c757d', // Grey
    info: '#17a2b8',  // Blue
    warn: '#ffc107',  // Yellow
    error: '#dc3545', // Red
    component: '#28a745' // Green for component names
  }
};

/**
 * Create a logger for a specific component
 * @param {string} component - Component name for log prefix
 * @param {number|string} level - Log level (4=debug, 3=info, 2=warn, 1=error)
 */
export default function createLogger(component, level = 3) {
  // Define level values - HIGHER number = MORE verbose
  const LOG_LEVELS = { error: 1, warn: 2, info: 3, debug: 4 };
  
  const getEffectiveLevel = () => {
    return typeof level === 'string' 
      ? LOG_LEVELS[level] || loggerConfig.defaultLevel 
      : level;
  };
  
  const shouldLog = (messageLevel) => {
    const effectiveLevel = getEffectiveLevel();
    return LOG_LEVELS[messageLevel] <= effectiveLevel;
  };
  
  // Format timestamp if enabled
  const timestamp = () => {
    if (!loggerConfig.showTimestamps) return '';
    
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${
      now.getMinutes().toString().padStart(2, '0')}:${
      now.getSeconds().toString().padStart(2, '0')}.${
      now.getMilliseconds().toString().padStart(3, '0')}]`;
  };
  
  // Format log messages with color
  const formatMessage = (level, message) => {
    const ts = timestamp();
    return [
      `%c${ts} %c[${component}] %c${level.toUpperCase()}: %c${message}`,
      `color: #6c757d`, // Timestamp in grey
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

// Export configuration - allows dynamic adjustment of log levels
export const configureLogger = (newConfig) => {
  loggerConfig = { ...loggerConfig, ...newConfig };
};


