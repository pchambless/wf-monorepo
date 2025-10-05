/**
 * Studio Sidebar EventType
 * Left column: App selector + Page list + EventType hierarchy
 */
export const columnSidebar = {
  eventType: "columnSidebar",
  category: "column",
  title: "App Page Designer",
  purpose: "App selection, page navigation, and eventType hierarchy display",

  components: [
    // App Selector
    {
      id: "selectApp",
      type: "select",
      container: "inline",
      position: { row: 1, col: 1 },
      props: {
        title: "Select App",
        options: ["plans", "client", "admin", "studio"],
        style: {
          marginBottom: "16px",
          width: "100%"
        }
      }
    },

    // Page List
    {
      id: "selectPage",
      container: "inline",
      position: { row: 2, col: 1 },
      props: {
        title: "Page List (select)",
      }
    },

    // Generate Page Config Button
    {
      id: "btnGenPageConfig",
      eventType: "btnGenPageConfig",
      container: "inline",
      position: { row: 3, col: 1 }
    }
  ]
};