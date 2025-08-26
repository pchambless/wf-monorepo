/**
* Plan detail tab eventType 
* Tab for viewing detailed information about a specific plan
*/
export const tabPlan = {
    category: "tab",
    title: "Plan Detail",
    cluster: "PLANS",
    purpose: "Get all plans for management",

    // Component layout with explicit mapping
    components: [
        {
            id: "hdrTabPlan",
            container: "inline",
            title: "Status + Plan Name",
            position: { row: 1, col: 1 },
            props: {
                title: "selectPlanStatus.selectedItem.label + formPlan.selectedRow.name",
                style: { fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0" }
            }
        },
        {
            id: "btnCreate",
            type: "button",
            container: "inline",
            position: { row: 2, col: 1 },
            props: {
                title: "Create New Plan",
                action: "create",
                targetForm: "formPlan",
                parentID: null  // No parent for plans
            }
        },
        {
            id: "selectPlanStatus",
            container: "inline",
            title: "Plan Status",
            position: { row: 1, col: 1 },
            span: { cols: 2, rows: 1 },
            props: {
                title: "Select Status"
            }
        },
        {
            id: "gridPlans",
            container: "inline",
            title: 'Status Plans',
            position: { row: 1, col: 3 },
            span: { cols: 1, rows: 20 },
            props: {
                title: "Status Plans",
                showToolbar: true
            }
        },
        {
            id: "formPlan",
            container: "inline",
            title: "Plan Details",
            position: { row: 2, col: 1 },
            span: { cols: 1, rows: 1 },
            props: {
                title: "Plan Details",
                allowEdit: true,
                showSaveButton: true
            }
        }
    ]
};