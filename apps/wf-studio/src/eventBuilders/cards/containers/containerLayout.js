export const containerLayout = {
    title: "Container Layout",
    cluster: "Container",
    purpose: "Configure container size, behavior and appearance",
    fields: [
        {
            name: "header",
            label: "Section Header",
            type: "text",
            percentage: "100%",
            placeholder: "Optional section header text",
            helpText: "Display text at top of section"
        },
        {
            name: "headerType",
            label: "Header Type",
            type: "select",
            options: ["textLine", "static", "dynamic"],
            defaultValue: "static"
        },
        {
            name: "contextKey",
            label: "Context Key",
            type: "text",
            showIf: "headerType === 'dynamic'",
            placeholder: "e.g., eventTypeID"
        },
        {
            name: "WorkArea",
            label: "Work Area",
            type: "text",
            percentage: "100%",
            placeholder: "Optional work area text",
            helpText: "Area for container components"
        },
        // Future: backgroundColor, padding, borders, etc.
    ]
};