/**
 * Plan Manager Layout EventTypes Index  
 * UI structure components - client-only imports
 */

// Import all individual layout eventTypes
import { pagePlanManager } from "./pagePlanManager.js";
import { tabsPlanTabs } from "./tabsPlanTabs.js";
import { tabPlan } from "./tabPlan.js";
import { tabPlanComms } from "./tabPlanComms.js";
import { tabPlanImpacts } from "./tabPlanImpacts.js";
import { gridPlans } from "./gridPlans.js";
import { formPlan } from "./formPlan.js";
import { selectPlanStatus } from "./selectPlanStatus.js"

// Named exports for individual imports
export {
  pagePlanManager,
  tabsPlanTabs,
  tabPlan,
  tabPlanComms,
  tabPlanImpacts,
  formPlan,
  selectPlanStatus
};

// Aggregate all planManager layout eventTypes into array
export const planManagerLayoutEvents = [
  pagePlanManager,
  tabsPlanTabs,
  tabPlan,
  tabPlanComms,
  tabPlanImpacts,
  gridPlans,
  formPlan,
  selectPlanStatus
];

// Combined export object
export const planManagerLayout = {
  pagePlanManager,
  tabsPlanTabs,
  tabPlan,
  tabPlanComms,
  tabPlanImpacts,
  gridPlans,
  formPlan,
  selectPlanStatus
};

export default {
  planManagerLayoutEvents,
  planManagerLayout
};