export const columnTemplate = {
  category: "column",
  
  // Column container contract - defines a layout column
  structure: {
    props: {
      title: "string",           // optional column title
      position: "string",        // left, middle, right, or flex position
      width: "string",           // fixed width (e.g., "280px")
      flex: "number",            // flex grow value (alternative to width)
      style: "object"            // styling overrides
    }
  },
  
  // Column behavior - how it fits in layout
  layout: {
    type: "column",             // vertical layout container
    scrollable: true,           // can scroll if content overflows
    resizable: false            // fixed width by default
  },

  // What PageRenderer expects for column category
  expectedStructure: {
    // Standard eventType fields
    id: "string",               // unique identifier
    category: "column",         // must be "column"
    title: "string",            // display title
    container: "column",        // container type
    
    // Layout positioning
    position: "string",         // left, middle, right
    width: "string",           // "280px", "200px", etc.
    flex: "number",            // alternative to width
    
    // Styling
    props: {
      title: "string",
      style: "object"           // CSS styles
    }
  },

  // Validation rules for eventType creation
  required: ["id", "category", "position"],
  
  validation: {
    "category": {
      type: "string",
      enum: ["column"]
    },
    "position": {
      type: "string", 
      enum: ["left", "middle", "right"]
    },
    "props.style": {
      type: "object"
    }
  }
};