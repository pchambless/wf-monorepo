export const appbar = {
    eventID: 100.1,
    eventType: "appbar",
    category: "appbar",
    title: "Plan Manager",
    cluster: "APPBAR",
    purpose: "APPBAR for the Plan Manager app",

    // Component layout with explicit mapping
    components: [
        {
            id: "appbarTitle",
            type: "text",
            position: { row: 1, col: 3 },
            span: { cols: 2, rows: 1 },
            props: {
                title: "Plan Manager",
            }
        },
        {
            id: "appbarLogout",
            type: "button",
            position: { row: 1, col: 5 },
            span: { cols: 1, rows: 1 },
            props: {
                actions: [
                    { type: "button", label: "Logout", icon: "logout-icon" },
                ]
            }
        }
    ]
};  