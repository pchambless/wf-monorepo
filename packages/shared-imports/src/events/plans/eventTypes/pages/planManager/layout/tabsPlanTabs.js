/**
 * Plan Management Tabs
 * Container for the tabs on the page
 */
export const tabsPlanTabs = {
  eventID: 100.5,
  eventType: "tabsPlanTabs",
  category: "tabs",
  title: "Tabs",
  cluster: "PLANS",
  purpose: "Container for the tabs on the page",
  
  // Component layout with explicit mapping
  components: [
    {
      id: "tabPlan",
      type: "tab",
      event: "tabPlan",
      position: { row: 1, col: 1 },
      span: { cols: 1, rows: 1 },
      props: {
        title: "Plan Details",
        active: true
      }
    },
    {
      id: "tabComms",
      type: "tab", 
      event: "tabPlanComms",
      position: { row: 1, col: 2 },
      span: { cols: 1, rows: 1 },
      props: {
        title: "Communications"
      }
    },
    {
      id: "tabImpacts",
      type: "tab",
      event: "tabPlanImpacts", 
      position: { row: 1, col: 3 },
      span: { cols: 1, rows: 1 },
      props: {
        title: "Impact Tracking"
      }
    }
  ]
};