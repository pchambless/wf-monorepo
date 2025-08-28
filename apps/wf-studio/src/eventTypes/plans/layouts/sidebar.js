/**
 * Sidebar EventType for Plan Management
 * Complete sidebar navigation with component array pattern
 */

export const sidebar = {
  category: "sidebar",
  title: "Sidebar",
  cluster: "SIDEBAR",
  purpose: "Complete sidebar navigation for plan management",

  components: [
    {
      id: "pageHeader",
      type: "header",
      position: { row: 1, col: 1 },
      props: {
        title: "Plan Management",
        style: { fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0" }
      }
    },
    {
      id: "planManagementSection",
      type: "section",
      position: { row: 2, col: 1 },
      props: {
        title: "PLAN MANAGEMENT",
        collapsible: false,
        items: [
          {
            id: "dashboardLink",
            title: "📊 Dashboard",
            path: "/dashboard",
            icon: "📊"
          },
          {
            id: "planManagerLink",
            title: "📋 Plan Manager",
            path: "/plans",
            icon: "📋",
            active: true
          }
        ]
      }
    },
    {
      id: "developmentSection",
      type: "section",
      position: { row: 3, col: 1 },
      props: {
        title: "DEVELOPMENT",
        collapsible: true,
        collapsed: false,
        items: [
          {
            id: "studioLink",
            title: "🎨 Studio",
            path: "/studio",
            icon: "🎨"
          },
          {
            id: "sketchPadLink",
            title: "📝 Sketch Pad",
            path: "https://asciiflow.com",
            icon: "📝",
            external: true
          }
        ]
      }
    }
  ]
};

