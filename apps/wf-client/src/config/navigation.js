/**
 * WF Client Navigation Configuration
 * 
 * Defines the sidebar navigation structure for the WhatsFresh client app.
 * Maps to eventTypes for dynamic route generation.
 */

import {
  LocalFlorist,
  Inventory,
  DataObject,
  AccountTree,
  Business,
  Engineering,
  Groups,
  Straighten,
  AccountBox
} from '@mui/icons-material';
import { SelUserAcct } from '@whatsfresh/shared-imports/jsx';

export const navigationSections = [
  {
    title: "Account",
    component: SelUserAcct,
    icon: AccountBox,
    description: "Select your account",
    position: "top",
    type: "widget"
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
    collapsible: true,
    icon: DataObject,
    description: "Manage reference data and lookup tables",
    items: [
      { 
        title: "Brands", 
        eventType: "brndList",
        icon: Business,
        description: "Manage brand information"
      },
      { 
        title: "Vendors", 
        eventType: "vndrList",
        icon: Engineering,
        description: "Manage vendor information"
      },
      { 
        title: "Workers", 
        eventType: "wrkrList",
        icon: Groups,
        description: "Manage worker information"
      },
      { 
        title: "Measurements", 
        eventType: "measList",
        icon: Straighten,
        description: "Manage measurement units"
      }
    ]
  },
  {
    title: "Mapping",
    eventType: "btchMap", 
    icon: AccountTree,
    description: "Manage batch mapping and relationships"
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
