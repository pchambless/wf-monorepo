export const tabPlanImpacts = {
    eventID: 100.8,
    eventType: "tabPlanImpacts",
    category: "tab",
    title: "Impacted Files",
    cluster: "PLANS",
    purpose: "Get all impacted files for a plan",
    
    // Component layout with explicit mapping
    components: [
        {
            id: "hdrTabPlanImpacts",
            type: "header",
            position: { row: 1, col: 1 },
            props: {
                title: "selectPlanStatus.selectedItem.label + gridPlanImpacts.selectedRow.name",
                style: { fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0" }
            }
        },
        {
            id: "gridImpacts",
            type: "grid",
            event: "gridPlanImpacts",
            position: { row: 2, col: 1 },
            span: { cols: 1, rows: 1 },
            props: {
                title: "Impact Tracking",
                showToolbar: true,
                allowCreate: true,
                allowEdit: true
            }
        }
    ]
};