/**
 * 🎯 Grid Standards - Executable Design System
 * 
 * Working documentation that stays current because code depends on it.
 * Used by: Cards, GenPageConfig, Studio UI tools
 * 
 * Auto-generates: grid-standards.mmd documentation
 */

// ============================================================================
// CORE STANDARDS
// ============================================================================

export const GRID_CONFIG = {
  COLUMNS: 10,
  DEFAULT_GAP: '8px',
  MIN_SPAN: 1,
  MAX_SPAN: 10
};

export const CONTAINER_TYPES = {
  PAGE: 'page',     // Top-level page grid (entire page)
  COLUMN: 'column', // Page-level columns (sidebar, content areas)  
  TAB: 'tab',       // Tab content grid (cards within tabs)
  CARD: 'card',     // Card internal layout
  MODAL: 'modal',   // Modal dialog grid
  INLINE: 'inline'  // Flow within parent container
};

export const POSITION_SCHEMA = {
  col: {
    start: { type: 'number', min: 1, max: 10, required: true },
    span: { type: 'number', min: 1, max: 10, required: true }
  },
  row: {
    start: { type: 'number', min: 1, required: true },
    span: { type: 'number', min: 1, required: true }
  }
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates position object structure and values
 */
export function validatePosition(position) {
  if (!position || typeof position !== 'object') {
    throw new Error('Position must be an object');
  }

  const { col, row } = position;

  // Validate column
  if (!col || typeof col !== 'object') {
    throw new Error('Position.col is required and must be an object');
  }
  if (!Number.isInteger(col.start) || col.start < 1 || col.start > GRID_CONFIG.COLUMNS) {
    throw new Error(`Position.col.start must be integer between 1 and ${GRID_CONFIG.COLUMNS}`);
  }
  if (!Number.isInteger(col.span) || col.span < 1 || col.span > GRID_CONFIG.COLUMNS) {
    throw new Error(`Position.col.span must be integer between 1 and ${GRID_CONFIG.COLUMNS}`);
  }
  if (col.start + col.span - 1 > GRID_CONFIG.COLUMNS) {
    throw new Error(`Position column range (${col.start} + ${col.span}) exceeds grid width (${GRID_CONFIG.COLUMNS})`);
  }

  // Validate row
  if (!row || typeof row !== 'object') {
    throw new Error('Position.row is required and must be an object');
  }
  if (!Number.isInteger(row.start) || row.start < 1) {
    throw new Error('Position.row.start must be positive integer');
  }
  if (!Number.isInteger(row.span) || row.span < 1) {
    throw new Error('Position.row.span must be positive integer');
  }

  return position; // Return validated position
}

/**
 * Validates container type
 */
export function validateContainer(container) {
  const validTypes = Object.values(CONTAINER_TYPES);
  if (!validTypes.includes(container)) {
    throw new Error(`Container must be one of: ${validTypes.join(', ')}`);
  }
  return container;
}

/**
 * Lightweight validation for GenPageConfig (non-throwing)
 */
export function isValidPosition(position) {
  try {
    validatePosition(position);
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// CSS GENERATION
// ============================================================================

/**
 * Generates CSS custom properties from position
 */
export function generateCSSProps(position) {
  validatePosition(position);
  
  return {
    '--col-start': position.col.start,
    '--col-span': position.col.span,
    '--row-start': position.row.start,
    '--row-span': position.row.span
  };
}

/**
 * Generates CSS classes for grid containers
 */
export function getContainerClasses(containerType) {
  validateContainer(containerType);
  
  const baseClasses = ['grid-container'];
  
  switch (containerType) {
    case CONTAINER_TYPES.PAGE:
      return [...baseClasses, 'page-grid'];
    case CONTAINER_TYPES.COLUMN:
      return [...baseClasses, 'column-grid'];
    case CONTAINER_TYPES.TAB:
      return [...baseClasses, 'tab-grid'];
    case CONTAINER_TYPES.CARD:
      return [...baseClasses, 'card-grid'];
    case CONTAINER_TYPES.MODAL:
      return [...baseClasses, 'modal-grid'];
    case CONTAINER_TYPES.INLINE:
      return ['inline-flow'];
    default:
      return baseClasses;
  }
}

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

/**
 * Common layout patterns for quick use
 */
export const LAYOUT_PATTERNS = {
  // Full width components
  FULL_WIDTH: { col: { start: 1, span: 10 }, row: { start: 1, span: 1 } },
  
  // Two-column layouts
  LEFT_HALF: { col: { start: 1, span: 5 }, row: { start: 1, span: 1 } },
  RIGHT_HALF: { col: { start: 6, span: 5 }, row: { start: 1, span: 1 } },
  
  // Three-column layouts (Studio style)
  LEFT_THIRD: { col: { start: 1, span: 3 }, row: { start: 1, span: 1 } },
  MIDDLE_THIRD: { col: { start: 4, span: 4 }, row: { start: 1, span: 1 } },
  RIGHT_THIRD: { col: { start: 8, span: 3 }, row: { start: 1, span: 1 } },
  
  // Card layouts within tabs
  CARD_TOP_LEFT: { col: { start: 1, span: 3 }, row: { start: 1, span: 1 } },
  CARD_TOP_RIGHT: { col: { start: 7, span: 4 }, row: { start: 1, span: 3 } },
  CARD_BOTTOM_LEFT: { col: { start: 1, span: 3 }, row: { start: 2, span: 1 } }
};

/**
 * Calculate percentage width from column span
 */
export function getWidthPercentage(span) {
  if (span < 1 || span > GRID_CONFIG.COLUMNS) {
    throw new Error(`Span must be between 1 and ${GRID_CONFIG.COLUMNS}`);
  }
  return `${(span / GRID_CONFIG.COLUMNS) * 100}%`;
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

/**
 * Generate example component structure
 */
export function createExample(id, title, containerType = CONTAINER_TYPES.INLINE, layoutPattern = LAYOUT_PATTERNS.FULL_WIDTH) {
  return {
    id,
    container: validateContainer(containerType),
    position: validatePosition(layoutPattern),
    props: {
      title,
      className: `component-${id}`
    }
  };
}

/**
 * Export standards for mermaid generation
 */
export function getStandardsForDocumentation() {
  return {
    gridConfig: GRID_CONFIG,
    containerTypes: CONTAINER_TYPES,
    positionSchema: POSITION_SCHEMA,
    layoutPatterns: LAYOUT_PATTERNS,
    generatedAt: new Date().toISOString()
  };
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

export const STANDARDS_VERSION = '1.0.0';
export const LAST_UPDATED = '2025-09-04';