/**
 * Plan Management Page EventType
 * Main page eventType for the Plan Management application
 */
export const pagePlanManager = {
    eventID: 100.5,
    eventType: "pagePlanManager",
    category: "page",
    title: "Plan Management",
    cluster: "PLANS",
    routePath: "/plan-manager",
    purpose: "Page for plan management and overview",
    // Component layout with explicit mapping
    components: [
        {
            id: "gridPlans",
            type: "grid",
            event: "gridPlans",
            position: { row: 1, col: 2 },
            span: { cols: 1, rows: 20 },
            props: {
                title: "Status Plans",
                showToolbar: true
            }
        },
        {
            id: "tabsPlanTabs",
            type: "tabs",
            event: "tabsPlanTabs",
            position: { row: 1, col: 5 },
            span: { cols: 50, rows: 20 },
            props: {
                title: "Plan Management Tabs"
            }
        }
    ]
};