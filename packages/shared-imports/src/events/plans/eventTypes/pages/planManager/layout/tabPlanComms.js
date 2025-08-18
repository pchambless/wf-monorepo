export const tabPlanComms = {
    eventID: 100.7,
    eventType: "tabPlanComms",
    category: "tab",
    title: "Communications",
    cluster: "PLANS",
    purpose: "Layout container for communications tab",

    // Component layout with explicit mapping
    components: [
        {
            id: "hdrTabPlanComms",
            type: "header",
            position: { row: 1, col: 1 },
            props: {
                title: "selectPlanStatus.selectedItem.label + gridPlanComms.selectedRow.name",
                style: { fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0" }
            }
        },
        {
            id: "gridPlanComms",
            type: "grid",
            event: "gridPlanComms",           // ← Explicit reference to query eventType
            position: { row: 2, col: 1 },    // ← Below the header
            span: { cols: 1, rows: 1 },
            props: {
                title: "Plan Communications",
                showToolbar: true,
                allowCreate: true
            }
        }
    ]
};  