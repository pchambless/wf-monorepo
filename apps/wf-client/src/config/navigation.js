/**
 * WF Client Navigation Configuration
 * 
 * Defines the sidebar navigation structure for the WhatsFresh client app.
 * Maps to eventTypes for dynamic route generation.
 */

import {
  LocalFlorist,
  Inventory,
  Business,
  Engineering,
  Groups,
  Straighten
} from '@mui/icons-material';
import { SelProd } from '@whatsfresh/shared-imports/jsx';
export const navigationSections = [

  {
    title: "Business Setup",
    type: "header"
  },
  {
    title: "Ingredients",
    eventType: "ingrTypeList",
    icon: LocalFlorist,
    description: "Manage ingredient types and categories"
  },
  {
    title: "Products",
    eventType: "prodTypeList",
    icon: Inventory,
    description: "Manage product types and categories"
  },
  {
    title: "Reference Data",
    type: "header"
  },
  {
    title: "Brands",
    eventType: "brndList",
    icon: Business
  },
  {
    title: "Vendors",
    eventType: "vndrList",
    icon: Engineering,
  },
  {
    title: "Workers",
    eventType: "wrkrList",
    icon: Groups,
  },
  {
    title: "Measurements",
    eventType: "measList",
    icon: Straighten,
  },
  {
    title: "Batch Management",
    type: "header"
  },
  {
    title: "SelProd",
    component: SelProd,
    description: "Select product for batch mapping - auto-loads batches and recipe data",
    type: "widget",
    contextParam: "prodID",
    props: {
      label: "Select Product"
    },
    onSelectionChange: "setParameter('prodID', value); navigateTo('prodBtchList'); execEvent('gridRcpe')" // Set prodID, navigate to batches, load recipe grid
  }
];

/**
 * Get navigation sections for the sidebar
 * @returns {Array} Array of navigation section objects
 */
export function getNavigationSections() {
  return navigationSections;
}

/**
 * Find a navigation item by eventType
 * @param {string} eventType - The eventType to search for
 * @returns {Object|null} The navigation item or null if not found
 */
export function getNavItemByEventType(eventType) {
  for (const section of navigationSections) {
    if (section.eventType === eventType) {
      return section;
    }
    if (section.items) {
      const item = section.items.find(item => item.eventType === eventType);
      if (item) return item;
    }
  }
  return null;
}

/**
 * Get all eventTypes used in navigation
 * @returns {Array} Array of eventType strings
 */
export function getNavigationEventTypes() {
  const eventTypes = [];

  navigationSections.forEach(section => {
    if (section.eventType) {
      eventTypes.push(section.eventType);
    }
    if (section.items) {
      section.items.forEach(item => {
        if (item.eventType) {
          eventTypes.push(item.eventType);
        }
      });
    }
  });

  return eventTypes;
}
