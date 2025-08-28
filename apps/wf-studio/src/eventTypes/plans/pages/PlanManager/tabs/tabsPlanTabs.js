/**
 * Plan Management Tabs
 * Container for the tabs on the page
 */
export const tabsPlanTabs = {
  category: "tabs",
  title: "Tabs",
  cluster: "TABS",
  purpose: "Container for the tabs on the page",

  // Component layout with explicit mapping
  components: [
    {
      id: "tabPlan",
      container: "tab",
      event: "tabPlan",
      position: { row: 1, col: 1 },
      span: { cols: 1, rows: 1 },
      props: {
        title: "Plan Details",
        active: true
      }
    },
    {
      id: "tabPlanComms",
      container: "tab",
      position: { row: 1, col: 2 },
      span: { cols: 1, rows: 1 },
      props: {
        title: "Communications"
      }
    },
    {
      id: "tabPlanImpacts",
      container: "tab",
      position: { row: 1, col: 3 },
      span: { cols: 1, rows: 1 },
      props: {
        title: "Impact Tracking"
      }
    }
  ]
};