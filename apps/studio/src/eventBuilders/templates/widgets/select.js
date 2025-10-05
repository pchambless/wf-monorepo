/**
 * Select Template EventType
 * Defines the Studio editing interface for creating select widget eventTypes
 */
category: "select";

export const select = {
    // Cards to show in Component Detail tab for grid eventTypes
    detailCards: [
        "basics",           // Basic Properties (category, title, cluster, purpose)
        "dbQuery",          // Query setup + field generation + execEvent workflow
        "workflowTriggers", // Event-based triggers (onRowSelect, onRefresh, etc.)
        "workflows"         // Standalone workflows (exportData, bulkActions)
    ]
};