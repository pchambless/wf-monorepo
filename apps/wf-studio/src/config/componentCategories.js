/**
 * Component Categories Configuration
 * Shared between Component Choices Panel and Category Dropdown
 * Single source of truth for Studio component organization
 */

export const COMPONENT_CATEGORIES = {
  // Container Types
  containers: [
    { id: 'tab', label: 'Tab', icon: 'folder', description: 'Tab container' },
    { id: 'layout', label: 'Layout', icon: 'box', description: 'Layout container' },
    { id: 'modal', label: 'Modal', icon: 'window', description: 'Modal dialog' },
    { id: 'page', label: 'Page', icon: 'document', description: 'Page container' }
  ],
  
  // Widget Types
  widgets: [
    { id: 'form', label: 'Form', icon: 'document-text', description: 'Form layout' },
    { id: 'grid', label: 'Grid', icon: 'table', description: 'Data grid' },
    { id: 'widget', label: 'Widget', icon: 'component', description: 'UI widget' },
    { id: 'component', label: 'Component', icon: 'puzzle', description: 'Generic component' }
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