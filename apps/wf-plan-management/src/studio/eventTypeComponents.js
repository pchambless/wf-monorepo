/**
 * EventType-Driven Studio Components
 * Dynamically generates Studio component palette from existing eventTypes
 */

/**
 * Fetch eventTypes from server API instead of importing
 */
async function fetchEventTypesFromServer() {
  try {
    const response = await fetch('http://localhost:3001/api/util/fetchEventTypes');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('Failed to fetch eventTypes:', result.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching eventTypes:', error);
    return [];
  }
}

/**
 * Map eventType categories to Studio component types
 */
const categoryToStudioComponent = {
  // Query EventTypes (Data-driven components)
  grid: {
    studioType: "DataGrid",
    label: "📊 Data Grid",
    description: "Sortable data table with filtering",
    section: "page",
    icon: "📊",
  },
  form: {
    studioType: "Form",
    label: "📝 Form",
    description: "Input form with validation",
    section: "page",
    icon: "📝",
  },
  "ui:Select": {
    studioType: "Select",
    label: "📋 Select",
    description: "Dropdown with data binding",
    section: ["appbar", "page"],
    icon: "📋",
  },

  // Layout EventTypes (Structure components)
  page: {
    studioType: "Page",
    label: "📄 Page",
    description: "Page container with routing",
    section: "page",
    icon: "📄",
  },
  tab: {
    studioType: "Tabs",
    label: "📑 Tabs",
    description: "Tabbed content areas",
    section: "page",
    icon: "📑",
  },
};

/**
 * Generate Studio components from eventTypes
 */
export async function generateStudioComponents() {
  const studioComponents = {
    appbar: [],
    sidebar: [],
    page: [],
  };

  // Fetch eventTypes from server
  const allEventTypes = await fetchEventTypesFromServer();
  console.log("📡 Fetched eventTypes for component generation:", allEventTypes.length);

  // Process each eventType
  allEventTypes.forEach((eventType) => {
    const mapping = categoryToStudioComponent[eventType.category];
    if (!mapping) return;

    const studioComponent = {
      type: mapping.studioType,
      key: eventType.eventType,           // Unique key using eventType name
      label: `${mapping.label} (${eventType.title})`,  // More specific label
      description: `${mapping.description} (${eventType.title})`,
      icon: mapping.icon,
      eventType: eventType.eventType,
      category: eventType.category,
      metadata: {
        eventID: eventType.eventID,
        cluster: eventType.cluster,
        dbTable: eventType.dbTable,
        navChildren: eventType.navChildren,
        workflows: eventType.workflows,
      },
    };

    // Add to appropriate sections
    const sections = Array.isArray(mapping.section)
      ? mapping.section
      : [mapping.section];
    sections.forEach((section) => {
      if (studioComponents[section]) {
        studioComponents[section].push(studioComponent);
      }
    });
  });

  return studioComponents;
}

/**
 * Get universal components (not tied to specific eventTypes)
 */
export function getUniversalComponents() {
  return [
    {
      type: "Icon",
      label: "🎨 Icon",
      description: "Brand icons, status indicators",
      icon: "🎨",
    },
    {
      type: "Text",
      label: "📝 Text",
      description: "Titles, labels, descriptions",
      icon: "📝",
    },
    {
      type: "Button",
      label: "🔘 Button",
      description: "Actions, navigation, triggers",
      icon: "🔘",
    },
    {
      type: "Link",
      label: "🔗 Link",
      description: "Navigation, external links",
      icon: "🔗",
    },
    {
      type: "Divider",
      label: "➖ Divider",
      description: "Visual separation",
      icon: "➖",
    },
    {
      type: "Container",
      label: "📦 Container",
      description: "Layout grouping",
      icon: "📦",
    },
  ];
}

/**
 * Get specialized components for specific sections
 */
export function getSpecializedComponents() {
  return {
    appbar: [
      {
        type: "AppLogo",
        label: "🏢 App Logo",
        description: "Company/app branding",
        icon: "🏢",
      },
      {
        type: "PageTitle",
        label: "📋 Page Title",
        description: "Current page title",
        icon: "📋",
      },
      {
        type: "UserProfile",
        label: "👤 User Profile",
        description: "User info & menu",
        icon: "👤",
      },
      {
        type: "Search",
        label: "🔍 Search",
        description: "Global search bar",
        icon: "🔍",
      },
    ],
    sidebar: [
      {
        type: "NavSection",
        label: "📂 Nav Section",
        description: "Navigation grouping",
        icon: "📂",
      },
      {
        type: "NavMenu",
        label: "📋 Nav Menu",
        description: "Collapsible menu group",
        icon: "📋",
      },
      {
        type: "NavItem",
        label: "📄 Nav Item",
        description: "Single navigation link",
        icon: "📄",
      },
    ],
  };
}

export default {
  generateStudioComponents,
  getUniversalComponents,
  getSpecializedComponents,
};
