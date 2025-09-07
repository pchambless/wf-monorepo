export const gridPlanImpacts = {
    category: "grid",
    qry: "planImpactList",
    title: "Plan Impacts",
    cluster: "IMPACTS",
    workflowTriggers: {
        onRefresh: ["execEvent"],
        onSelect: ["validateAccess", "refreshContext"],
        onCreate: ["createRecord"],
    },
    workflows: ["createPlanImpact"],
    purpose: "Get file impacts for a specific plan",
    // Component layout with explicit mapping
}