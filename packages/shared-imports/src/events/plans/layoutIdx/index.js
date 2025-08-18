/**
 * Plan EventTypes Index
 * Aggregates all individual eventType files into PLAN_EVENTS array
 */

// Import all individual eventTypes
import { appbar } from "../eventTypes/app/appbar.js";
import { sidebar } from "../eventTypes/app/sidebar.js";
import { pagePlanManager } from "../eventTypes/pages/planManager/layout/pagePlanManager.js";
import { tabsPlanTabs } from "../eventTypes/pages/planManager/layout/tabsPlanTabs.js";
import { tabPlan } from "../eventTypes/pages/planManager/layout/tabPlan.js";
import { tabPlanComms } from "../eventTypes/pages/planManager/layout/tabPlanComms.js";
import { tabPlanImpacts } from "../eventTypes/pages/planManager/layout/tabPlanImpacts.js";



// Aggregate all eventTypes into PLAN_EVENTS array
export const layoutEvents = [
  pagePlanManager,
  tabsPlanTabs,
  tabPlan,
  tabPlanComms,
  tabPlanImpacts,
  appbar,
  sidebar
];

/**
 * Get event by eventType
 */
export const getLayoutEvent = (eventType) => {
  return layoutEvents.find((event) => event.eventType === eventType);
};

/**
 * Get all plan layout events (for main index.js)
 */
export const getPlanLayoutEvents = () => layoutEvents;

// Default export for backward compatibility
export default {
  layoutEvents,
  getLayoutEvent,
  getPlanLayoutEvents
};
