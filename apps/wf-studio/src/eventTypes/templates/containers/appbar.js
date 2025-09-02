export const appbarTemplate = {
  category: "appbar",
  
  // Appbar container contract - defines top navigation bar
  structure: {
    props: {
      title: "string",           // app/page title
      logo: "string",            // optional logo URL
      actions: "array",          // action buttons/menus
      breadcrumbs: "array",      // optional navigation breadcrumbs
      showSearch: "boolean"      // show search input
    }
  },
  
  // Appbar behavior - how it positions and behaves
  layout: {
    position: "sticky",         // sticks to top of viewport
    height: "56px",            // standard material design height
    zIndex: 1000,              // above other content
    fullWidth: true            // spans full container width
  },

  // What PageRenderer expects for appbar category
  expectedStructure: {
    // Standard eventType fields
    id: "string",               // unique identifier
    category: "appbar",         // must be "appbar"
    title: "string",            // display title
    container: "appbar",        // container type
    
    // Appbar-specific properties
    props: {
      title: "string",          // main title
      logo: "string",           // optional logo
      actions: "array",         // action definitions
      breadcrumbs: "array",     // navigation breadcrumbs
      showSearch: "boolean",    // search visibility
      style: "object"           // CSS styling
    }
  },

  // Action structure for appbar buttons/menus
  actionStructure: {
    id: "string",              // action identifier
    type: "string",            // button, menu, separator
    label: "string",           // display text
    icon: "string",            // optional icon name
    onClick: "string",         // workflow trigger
    position: "string"         // left, center, right
  },

  // Validation rules for eventType creation
  required: ["id", "category", "props.title"],
  
  validation: {
    "category": {
      type: "string",
      enum: ["appbar"]
    },
    "props.title": {
      type: "string",
      minLength: 1
    },
    "props.actions": {
      type: "array",
      items: {
        id: { type: "string", required: true },
        type: { type: "string", required: true },
        label: { type: "string", required: true }
      }
    }
  }
};