export const select = {
    category: "card",
    title: "Select Properties",
    cluster: "Widgets",
    qry: qry,
    purpose: "Select eventType - Sets Select value",
    workflowTriggers: {
        onCategoryChange: ["updateAvailablePatterns"],
        onTitleChange: ["generateEventTypeId"],
        onClusterChange: ["validateClusterExists"]
    },
    fields: [
        {
            name: "id",
            label: "ID",
            type: "any",
            required: true,
            percentage: "30%",
        },
        {
            name: "label",
            label: "Label",
            type: "text",
            required: true,
            percentage: "60%",
            breakAfter: true,
            placeholder: "User-friendly display name"
        }
    ],
    workflow: {
        onChange: ["setVal:id"]
    }
};