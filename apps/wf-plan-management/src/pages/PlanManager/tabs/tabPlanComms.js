export const tabPlanComms = {
    category: "tab",
    title: "Communications",
    cluster: "COMMUNICATE",
    purpose: "Layout container for communications tab",

    // Component layout with explicit mapping
    components: [
        {
            id: "hdrTabPlanComms",
            container: "inline",
            position: { row: 1, col: 1 },
            props: {
                title: "selectPlanStatus.selectedItem.label + gridPlanComms.selectedRow.name",
                style: { fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0" }
            }
        },
        {
            id: "btnCreate",
            type: "button",
            container: "inline",
            position: { row: 2, col: 1 },
            props: {
                title: "Create Communication",
                action: "create",
                targetForm: "formPlanComm",
                parentID: ":planID"  // Uses selectedPlanId
            }
        },
        {
            id: "gridPlanComms",
            container: "inline",
            position: { row: 2, col: 1 },    // ← Below the header
            span: { cols: 1, rows: 1 },
            props: {
                title: "Plan Communications",
                showToolbar: true,
                allowCreate: true
            }
        },
        {
            id: "formPlanComm",
            container: "inline",
            position: { row: 3, col: 1 },
            span: { cols: 1, rows: 1 },
            props: {
                title: "Communication Details"
            }
        }
    ]
};  