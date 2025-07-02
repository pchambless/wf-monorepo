/**
 * Client App Sidebar Navigation Configuration
 * Hand-crafted navigation structure for optimal UX workflow
 */

export const SIDEBAR_SECTIONS = [
  {
    id: 'ingredients',
    title: 'Ingredients',
    icon: 'LocalDining',
    collapsible: false,
    items: [
      {
        id: 'ingrTypes',
        label: 'Ingredient Types',
        eventType: 'ingrTypeList',
        description: 'Manage ingredient categories and types'
      }
    ]
  },
  {
    id: 'products',
    title: 'Products',
    icon: 'Inventory',
    collapsible: false,
    items: [
      {
        id: 'prodTypes',
        label: 'Product Types',
        eventType: 'prodTypeList',
        description: 'Manage product categories and types'
      }
    ]
  },
  {
    id: 'mapping',
    title: 'Mapping',
    icon: 'AccountTree',
    collapsible: false,
    items: [
      {
        id: 'batchMapping',
        label: 'Batch Mapping',
        eventType: 'btchMapDetail', // Future mapping page
        description: 'Map ingredient batches to product batches',
        disabled: true // Enable when mapping page is ready
      }
    ]
  },
  {
    id: 'reference',
    title: 'Reference',
    icon: 'Settings',
    collapsible: true,
    defaultCollapsed: true,
    items: [
      {
        id: 'brands',
        label: 'Brands',
        eventType: 'brndList',
        description: 'Manage ingredient and product brands'
      },
      {
        id: 'vendors',
        label: 'Vendors',
        eventType: 'vndrList',
        description: 'Manage supplier and vendor information'
      },
      {
        id: 'workers',
        label: 'Workers',
        eventType: 'wrkrList',
        description: 'Manage worker and staff information'
      },
      {
        id: 'measurements',
        label: 'Measurements',
        eventType: 'measList',
        description: 'Manage units of measurement'
      }
    ]
  }
];

/**
 * Get navigation sections for the client app
 */
export function getNavSections() {
  return SIDEBAR_SECTIONS;
}

/**
 * Get route info by eventType
 */
export function getRoute(eventType) {
  for (const section of SIDEBAR_SECTIONS) {
    for (const item of section.items) {
      if (item.eventType === eventType) {
        return {
          eventType: item.eventType,
          label: item.label,
          section: section.title
        };
      }
    }
  }
  return null;
}