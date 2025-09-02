export const tabsTemplate = {
  category: ["tabs", "tab"], // Handles both tabs containers AND individual tabs
  
  // Cards to show in Component Detail tab for both categories
  detailCards: [
    "cardBasics",           // Basic Properties (category, title, cluster, purpose)
    "cardComponentLayout"   // Manage components array (tabs OR tab content)
  ],
  
  // What PageRenderer expects for both categories
  expectedStructure: {
    category: "string",     // "tabs" or "tab"
    title: "string",
    cluster: "string", 
    purpose: "string",
    components: "array"     // Array of child components
  },
  
  // Component structure - varies by container type
  componentStructure: {
    // For category: "tabs" (tabs container)
    tabs: {
      id: "string",         // references tab eventType
      container: "tab",     // must be "tab"
      event: "string",      // eventType reference (optional)
      position: "object",   // ordering
      props: {
        title: "string",    // tab label
        active: "boolean"   // default active (optional)
      }
    },
    
    // For category: "tab" (individual tab content)
    tab: {
      id: "string",         // references any eventType (grid, form, etc.)
      container: "string",  // "inline", "card", etc.
      position: "object",   // row/col positioning
      props: "object"       // instance-specific overrides
    }
  },

  // Validation rules
  required: ["category", "title", "components"],
  
  validation: {
    "category": {
      type: "string",
      enum: ["tabs", "tab"]
    },
    "components": {
      type: "array",
      minItems: 1,
      items: {
        id: { type: "string", required: true },
        container: { type: "string", required: true }
      }
    }
  }
};