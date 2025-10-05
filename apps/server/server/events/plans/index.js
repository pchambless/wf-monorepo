/**
 * Plan Manager query EventTypes Index
 */

// Import all individual eventTypes
import { planCommDtl } from "./planCommDtl.js";
import { planCommList } from "./planCommList.js";
import { planDtl } from "./planDtl.js";
import { planList } from "./planList.js";
import { planImpactDtl } from "./planImpactDtl.js";
import { planImpactList } from "./planImpactList.js";

// Aggregate all planManager query eventTypes into array with eventType property
const plansQueryEvents = [
    { ...planCommDtl, eventType: "planCommDtl" },
    { ...planCommList, eventType: "planCommList" },
    { ...planDtl, eventType: "planDtl" },
    { ...planList, eventType: "planList" },
    { ...planImpactDtl, eventType: "planImpactDtl" },
    { ...planImpactList, eventType: "planImpactList" }
];

export default {
    plansQueryEvents,
};
