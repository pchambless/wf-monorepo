/**
 * select plan status event type
 * populates the select dropdown for plan status
 * used in plan management and plan detail tabs
 */
export const selectPlanStatus = {
    eventID: 100.6,
    eventType: "selectPlanStatus",
    event: "planStatusList", category: "select",
    title: "Plan Status",
    cluster: "PLANS",
    configOptions: { sortByOrder: true },
    purpose: "Filter plans by status selection",
    // Component layout with explicit mapping
    workflow: {
        onSelectionChange: [
            "setContext:planStatus",     // contextStore.setParam('planStatus', selectedValue)
            "refreshComponent:gridPlans" // Trigger gridPlans to reload
        ]
    }
};
