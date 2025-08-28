/**
 * select plan status event type
 * populates the select dropdown for plan status
 * used in plan management and plan detail tabs
 */
export const selectPlanStatus = {
    qry: "selectPlanStatus",
    category: "select",
    title: "Plan Status",
    cluster: "PLANS",
    entryPoint: true,
    method: "CONFIG",
    configKey: "planStatus",
    configOptions: { sortByOrder: true },
    purpose: "Filter plans by status selection",
    workflowTriggers: {
        onLoad: ["CONFIG"],
        onSelectionChange: [
            { action: "setContext", param: "planStatus" },
            { action: "refresh", targets: ["gridPlans"] }
        ]
    },
    defaultValue: "pending"
};
