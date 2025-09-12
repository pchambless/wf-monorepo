// This Template might orchestrate the structure of the app.  It is not really 
// a part of the pageConfig, but may be a separate configuration process.  
// this may be a futuristic enhancement.  But it might be a good placeholder.
export const AppTemplate = {
    category: "column",

    // Cards to show in Component Detail tab for column eventTypes
    detailCards: [
        "basics",           // Basic Properties (category, title, cluster, purpose)
        "columnLayout",     // Position, width, flex, scrollable
        "componentLayout"   // Child components array
    ]
};