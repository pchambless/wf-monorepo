/**
* Plan detail tab eventType 
* Tab for viewing detailed information about a specific plan
*/
export const tabPlan = {
    eventID: 100.7,
    eventType: "tabPlan",
    category: "tab",
    title: "Plan Detail",
    cluster: "PLANS",
    purpose: "Get all plans for management",

    // Component layout with explicit mapping
    components: [
        {
            id: "hdrTabPlan",
            type: "header",
            position: { row: 1, col: 1 },
            props: {
                title: "selectPlanStatus.selectedItem.label + formPlan.selectedRow.name",
                style: { fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0" }
            }
        },
        {
            id: "selectPlanStatus",
            type: "select",
            event: "selectPlanStatus",
            position: { row: 1, col: 1 },
            span: { cols: 2, rows: 1 },
            props: {
                title: "Select Status"
            }
        },
        {
            id: "formPlan",
            type: "form",
            event: "formPlan",
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