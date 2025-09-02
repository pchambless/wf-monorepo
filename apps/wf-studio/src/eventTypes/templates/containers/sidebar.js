export const sidebarTemplate = {
  category: "sidebar",
  
  // Generic container contract - arranges eventTypes vertically
  structure: {
    props: {
      title: "string",           // optional sidebar title
      sections: "array"          // required array of eventType references
    }
  },
  
  // Section structure - references to other eventTypes
  sectionStructure: {
    eventType: "string",         // name of eventType to render
    position: "number",          // ordering within sidebar
    props: "object"              // optional props to pass to eventType
  },

  // Container behavior - how sidebar arranges its children
  layout: {
    direction: "vertical",       // sections arranged top to bottom
    scrollable: true,           // sidebar can scroll if content overflows
    collapsible: false          // sidebar doesn't collapse by default
  },

  // Validation rules - just structure validation
  required: ["props.sections"],
  
  validation: {
    "props.sections": {
      type: "array",
      minItems: 1,
      items: {
        eventType: { type: "string", required: true },
        position: { type: "number", required: false },
        props: { type: "object", required: false }
      }
    }
  }
};