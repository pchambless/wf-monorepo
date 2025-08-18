/**
 * EventType to Studio Converter
 * Generates Studio design files from existing eventTypes
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
const eventTypeToStudioComponent = {
  "ui:Select": "Select",
  grid: "DataGrid",
  form: "Form",
  tab: "Tab",           // Individual tab
  tabs: "TabContainer", // Tab container with children
  page: "Page",
};

/**
 * Get default size for Studio component type
 */
function getDefaultSize(studioType) {
  switch (studioType) {
    case 'DataGrid': return { width: 250, height: 150 };
    case 'Form': return { width: 200, height: 120 };
    case 'Tab': return { width: 150, height: 40 };        // Individual tab
    case 'TabContainer': return { width: 400, height: 200 }; // Tab container
    case 'Tabs': return { width: 300, height: 80 };      // Legacy
    case 'Card': return { width: 180, height: 100 };
    case 'Select': return { width: 120, height: 40 };
    case 'Page': return { width: 400, height: 300 };
    default: return { width: 120, height: 60 };
  }
}

/**
 * Convert eventType to Studio component
 */
function eventTypeToComponent(eventType, index = 0) {
  const studioType = eventTypeToStudioComponent[eventType.category];
  if (!studioType) return null;

  return {
    id: `page_${eventType.eventType.toLowerCase()}`,
    type: studioType,
    section: "page",
    bindings: {
      eventType: eventType.eventType,
      eventID: eventType.eventID,
      title: eventType.title,
      cluster: eventType.cluster,
      navChildren: eventType.navChildren,
      dbTable: eventType.dbTable,
      workflows: eventType.workflows,
      qrySQL: eventType.qrySQL,
      params: eventType.params,
    },
    position: {
      x: (index % 3) * 200,
      y: Math.floor(index / 3) * 100,
    },
    size: getDefaultSize(studioType),
    config: {
      generated: true,
      fromEventType: eventType.eventType,
    },
  };
}

/**
 * Generate Studio design for plan-manager page from existing eventTypes
 */
export async function generatePlanManagerStudio() {
  console.log("🏗️ Generating Studio design from eventTypes...");

  // Fetch eventTypes from server
  const allEventTypes = await fetchEventTypesFromServer();
  console.log("📡 Fetched eventTypes from server:", allEventTypes.length);

  // Filter to plan-manager eventTypes
  const planManagerEventTypes = allEventTypes.filter(eventType => 
    ['selectPlanStatus', 'gridPlans', 'formPlan', 'tabsPlanTabs'].includes(eventType.eventType)
  );

  // Convert eventTypes to Studio components
  const components = allEventTypes
    .map((eventType, index) => eventTypeToComponent(eventType, index))
    .filter(Boolean);

  console.log("🏗️ Generated components:", components);

  // Create the Studio design structure
  const studioDesign = {
    appName: "plans",
    pageName: "plan-manager",
    section: "page",
    version: "1.0.0",
    lastModified: new Date().toISOString(),
    components: components,
    metadata: {
      componentCount: components.length,
      purpose: "Generated from existing eventTypes",
      sourceEventTypes: allEventTypes.map((et) => et.eventType),
      generatedAt: new Date().toISOString(),
    },
  };

  return studioDesign;
}

/**
 * Save generated Studio design to server
 */
export async function saveGeneratedStudio() {
  const studioDesign = generatePlanManagerStudio();

  try {
    const response = await fetch("http://localhost:3001/api/execCreateDoc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        targetPath: "analysis-n-document/genOps/studio/plans",
        fileName: "plan-manager-page.json",
        content: JSON.stringify(studioDesign, null, 2),
      }),
    });

    if (response.ok) {
      console.log("✅ Generated Studio design saved successfully!");
      return true;
    } else {
      console.error("❌ Failed to save generated Studio design");
      return false;
    }
  } catch (error) {
    console.error("❌ Error saving generated Studio design:", error);
    return false;
  }
}

export default {
  generatePlanManagerStudio,
  saveGeneratedStudio,
};
