/**
 * Select Template EventType
 * Defines the Studio editing interface for creating select widget eventTypes
 */
export const select = {
    category: "template",
    title: "Select Template",
    cluster: "templates",
    purpose: "Template for creating select widget eventTypes - defines Studio editing cards",

    components: [
        {
            id: "cardBasics",
            container: "card",
            position: { row: 1, col: 1 }
        },
        {
            id: "cardDataBinding",
            container: "card",
            position: { row: 2, col: 1 }
        },
        {
            id: "cardSelect",
            container: "card",
            position: { row: 3, col: 1 },
        },
        {
            id: "cardWorkflowTriggers",
            type: "card",
            container: "card",
            position: { row: 4, col: 1 },
        },
        {
            id: "cardWorkflows",
            type: "card",
            container: "card",
            position: { row: 5, col: 1 },
        }
    ],

    // Template metadata
    hasComponents: true,
    hasWorkflows: true,
    isTemplate: true
};