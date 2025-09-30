export const tabPlanImpacts = {
    category: "tab",
    title: "Impacted Files",
    cluster: "IMPACTS",
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
            id: "btnCreate",
            type: "button",
            container: "inline",
            position: { row: 1, col: 1 },
            props: {
                title: "Log Impact",
                action: "create",
                targetForm: "formPlanImpact",
                parentIdField: "plan_id"  // Uses selectedPlanId
            }
        },
        {
            id: "gridPlanImpacts",
            container: "inline",
            event: "gridPlanImpacts",
            position: { row: 2, col: 1 },
            span: { cols: 1, rows: 15 },
            props: {
                title: "Impact Tracking",
                showToolbar: true,
                allowCreate: true,
                allowEdit: true
            },
        },
        {
            id: "formPlanImpact",
            container: "inline",
            event: "formPlanImpact",
            position: { row: 2, col: 3 },
            span: { cols: 3, rows: 15 },
            props: {
                title: "Impact Tracking",
                showToolbar: true,
                allowCreate: true,
                allowEdit: true
            }
        }
    ]
};