/**
 * Client Entity Registry - Generation Templates
 * These are templates used to generate app-specific page maps
 */

export const clientEntityRegistry = {
    // Special pages section
    "dashboard": {
        pageIndexPath: "0-Dashboard/dashboard/index.jsx",
        title: "Dashboard",
        layout: "MainLayout",
        routeKey: "DASHBOARD",
        icon: "Dashboard",
        section: "main",
        sectionOrder: 10,
        type: "dashboard",
        widgets: [
            { id: "recentIngrBtchList", size: "medium", position: 1 },
            { id: "recentProdBtchList", size: "medium", position: 2 },
            { id: "alertsWidget", size: "small", position: 3 },
            { id: "quickLinks", size: "small", position: 4 }
        ],
        color: "teal",
        import: true
    },

    // Auth flow
    "userLogin": {
        pageIndexPath: "0-Auth/01-Login/index.js",
        title: "Login",
        layout: "AuthLayout",
        routeKey: "LOGIN",
        icon: "Login",
        section: "auth",
        type: "authForm",
        color: "blue",
        import: true
    },
};
