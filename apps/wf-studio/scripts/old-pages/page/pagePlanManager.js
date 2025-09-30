/**
 * Plan Management Page EventType
 * Main page eventType for the Plan Management application
 */
export const pagePlanManager = {
    category: "page",
    title: "Plan Management",
    cluster: "PAGE",
    routePath: "/plan-manager",
    purpose: "Page for plan management and overview",
    // Component layout with explicit mapping
    components: [
        {
            id: "tabsPlanTabs",
            container: "tabs",
            event: "tabsPlanTabs",
            position: { row: 1, col: 5 },
            span: { cols: 50, rows: 20 },
            props: {
                title: "Plan Management Tabs"
            }
        }
    ]
};