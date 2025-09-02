/**
 * Component Categories Configuration
 * Shared between Component Choices Panel and Category Dropdown
 * Single source of truth for Studio component organization
 */

export const COMPONENT_CATEGORIES = {
  // Container Types - Component-based eventTypes with layout focus
  containers: [
    {
      id: 'tab',
      label: 'Tab',
      icon: 'folder',
      description: 'Tab container',
      detailView: 'TabDetail',
      pattern: 'component-based'
    },
    {
      id: 'column',
      label: 'Column',
      icon: 'folder',
      description: 'Column container',
      detailView: 'ColumnDetail',
      pattern: 'component-based'
    },
    {
      id: 'section',
      label: 'Section',
      icon: 'document',
      description: 'Section container',
      detailView: 'SectionDetail',
      pattern: 'component-based'
    },
    {
      id: 'layout',
      label: 'Layout',
      icon: 'box',
      description: 'Layout container',
      detailView: 'ContainerComponentDetail',
      pattern: 'component-based'
    },
    {
      id: 'modal',
      label: 'Modal',
      icon: 'window',
      description: 'Modal dialog',
      detailView: 'ContainerComponentDetail',
      pattern: 'component-based'
    },
    {
      id: 'page',
      label: 'Page',
      icon: 'document',
      description: 'Page container',
      detailView: 'ContainerComponentDetail',
      pattern: 'component-based'
    }
  ],

  // Widget Types - Can be either qry-based or component-based
  widgets: [
    {
      id: 'form',
      label: 'Form',
      icon: 'document-text',
      description: 'Form layout',
      detailView: 'LeafComponentDetail', // Usually qry-based for data forms
      pattern: 'qry-based'
    },
    {
      id: 'grid',
      label: 'Grid',
      icon: 'table',
      description: 'Data grid',
      detailView: 'LeafComponentDetail', // Usually qry-based for data display
      pattern: 'qry-based'
    },
    {
      id: 'widget',
      label: 'Widget',
      icon: 'component',
      description: 'UI widget',
      detailView: 'ContainerComponentDetail', // Usually component-based
      pattern: 'component-based'
    },
    {
      id: 'component',
      label: 'Component',
      icon: 'puzzle',
      description: 'Generic component',
      detailView: 'dynamic', // Detect based on eventType structure
      pattern: 'auto-detect'
    }
  ]
};

/**
 * Get all categories as flat list for dropdown
 */
export function getAllCategories() {
  return [
    ...COMPONENT_CATEGORIES.containers,
    ...COMPONENT_CATEGORIES.widgets
  ];
}

/**
 * Get categories grouped for Component Choices Panel
 */
export function getCategoriesGrouped() {
  return {
    containers: COMPONENT_CATEGORIES.containers,
    widgets: COMPONENT_CATEGORIES.widgets
  };
}

/**
 * Get category options for dropdown (id/label pairs)
 */
export function getCategoryOptions() {
  return getAllCategories().map(cat => ({
    value: cat.id,
    label: cat.label,
    description: cat.description
  }));
}

/**
 * Determine which detail view component to use for an eventType
 * @param {Object} eventTypeData - The eventType object
 * @returns {string} - Component name to use for detail view
 */
export function getDetailViewForEventType(eventTypeData) {
  if (!eventTypeData || !eventTypeData.category) {
    return 'LeafComponentDetail'; // Default fallback
  }

  // Find the category configuration
  const category = getAllCategories().find(cat => cat.id === eventTypeData.category);

  if (!category) {
    return 'LeafComponentDetail'; // Default fallback
  }

  // Handle dynamic detection
  if (category.detailView === 'dynamic') {
    return detectEventTypePattern(eventTypeData);
  }

  return category.detailView;
}

/**
 * Auto-detect eventType pattern for dynamic categories
 * @param {Object} eventTypeData - The eventType object
 * @returns {string} - Detected detail view component
 */
function detectEventTypePattern(eventTypeData) {
  // Check for qry-based pattern (leaf component)
  if (eventTypeData.qry) {
    return 'LeafComponentDetail';
  }

  // Check for component-based pattern (container)
  if (eventTypeData.components && Array.isArray(eventTypeData.components)) {
    return 'ContainerComponentDetail';
  }

  // Check for hasComponents flag
  if (eventTypeData.hasComponents === true) {
    return 'ContainerComponentDetail';
  }

  // Default to leaf component for simple eventTypes
  return 'LeafComponentDetail';
}

/**
 * Get the expected pattern for a category
 * @param {string} categoryId - The category ID
 * @returns {string} - Expected pattern ('qry-based', 'component-based', 'auto-detect')
 */
export function getCategoryPattern(categoryId) {
  const category = getAllCategories().find(cat => cat.id === categoryId);
  return category ? category.pattern : 'auto-detect';
}