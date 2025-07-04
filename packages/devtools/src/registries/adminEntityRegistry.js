/**
 * Admin Entity Registry - Generation Templates
 * These are templates used to generate app-specific page maps
 */

export const adminEntityRegistry = {
    acctList: {
        pageIndexPath: "01-acctList/index.jsx",
        title: "Accounts",
        layout: "CrudLayout",
        routeKey: "ADMIN_ACCOUNTS",
        icon: "AccountBox",
        section: "admin",
        sectionOrder: 1,
        itemOrder: 1,
        color: "indigo",
        import: true
    },
    userList: {
        pageIndexPath: "02-userList/index.jsx",
        title: "Users",
        layout: "CrudLayout",
        routeKey: "ADMIN_USERS",
        icon: "Group",
        section: "admin",
        itemOrder: 2,
        color: "indigo",
        import: true
    }
};

export const getEntityConfig = (eventType, registry = adminEntityRegistry) => registry[eventType] || null;

export const getEntitiesBySection = (section = "admin", registry = adminEntityRegistry) => {
    return Object.entries(registry)
        .filter(([_, config]) => config.section === section)
        .sort((a, b) => (a[1].itemOrder || 999) - (b[1].itemOrder || 999))
        .map(([eventName, config]) => ({ eventName, ...config }));
};
