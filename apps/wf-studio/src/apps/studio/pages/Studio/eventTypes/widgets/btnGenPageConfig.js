/**
 * Studio Generate Page Config Button Widget
 * Triggers page config regeneration for selected app/page
 */
export const btnGenPageConfig = {
    category: "button",
    title: "Generate Page Config Button",
    cluster: "STUDIO",
    purpose: "Regenerate pageConfig.json and pageMermaid.mmd files",

    props: {
        label: "Gem PageConfig",
        variant: "primary",
        size: "medium",
        style: {
            marginTop: "16px",
            width: "100%"
        }
    },

    workflowTriggers: {
        onClick: [
            { action: "execGenPageConfig", params: { appID: "{{getVal.appID}}", pageID: "{{getVal.pageID}}" } },
            { action: "refresh", targets: ["tabMermaid", "tabPageView"] },
            { action: "showNotification", message: "Page config regenerated!" }
        ]
    }
};