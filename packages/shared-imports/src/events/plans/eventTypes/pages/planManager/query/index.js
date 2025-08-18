/**
 * Plan Manager query EventTypes Index
 */

// Import all individual eventTypes
import { selectPlanStatus } from "../layout/selectPlanStatus.js";
import { gridPlans } from "../layout/gridPlans.js";
import { formPlan } from "../layout/formPlan.js";

import { gridPlanComms } from "./gridPlanComms.js";
import { formPlanComm } from "./formPlanComm.js";

import { gridPlanImpacts } from "./gridPlanImpacts.js";
import { formPlanImpact } from "./formPlanImpact.js";

// Aggregate all planManager query eventTypes into array
export const planManagerQueryEvents = [
    selectPlanStatus,
    gridPlans,
    gridPlanComms,
    gridPlanImpacts,
    formPlan,
    formPlanComm,
    formPlanImpact,
];

export default {
    planManagerQueryEvents,
};
