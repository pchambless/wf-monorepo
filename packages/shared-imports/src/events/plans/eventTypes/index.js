/**
 * Plan EventTypes Index
 * Aggregates all individual eventType files into PLAN_EVENTS array
 */

// Import all individual eventTypes
import { gridPlanList } from "./grid-planList.js";
import { selectPlanStatus } from "./select-planStatus.js";
import { formPlanDetail } from "./form-planDetail.js";
import { pagePlanManagement } from "./page-planManagement.js";
import { tabPlanDetail } from "./tab-planDetail.js";
import { tabPlanCommunications } from "./tab-planCommuncations.js";
import { tabPlanImpacts } from "./tab-planImpacts.js";
import { gridPlanCommunicationList } from "./grid-planCommunicationList.js";
import { gridPlanImpactList } from "./grid-planImpactList.js";

// Aggregate all eventTypes into PLAN_EVENTS array
export const PLAN_EVENTS = [
  pagePlanManagement,
  selectPlanStatus,
  tabPlanDetail,
  tabPlanCommunications,
  tabPlanImpacts,
  gridPlanList,
  gridPlanCommunicationList,
  gridPlanImpactList,
  formPlanDetail,
];

/**
 * Get event by eventType
 */
export const getPlanEventType = (eventType) => {
  return PLAN_EVENTS.find((event) => event.eventType === eventType);
};

// Default export for backward compatibility
export default {
  PLAN_EVENTS,
  getPlanEventType,
};
