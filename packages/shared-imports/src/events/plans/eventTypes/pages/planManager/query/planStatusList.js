/**
 * select plan status event type
 * populates the select dropdown for plan status
 * used in plan management and plan detail tabs
 */
export const planStatusList = {
    eventID: 100.7,
    eventType: "planStatusList",
    title: "Plan Status",
    cluster: "PLANS",
    method: "CONFIG",
    configKey: "planStatus",
    configOptions: { sortByOrder: true },
    purpose: "Filter plans by status selection",
};