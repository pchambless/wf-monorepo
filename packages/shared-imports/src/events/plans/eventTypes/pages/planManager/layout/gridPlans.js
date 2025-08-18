export const gridPlans = {
  eventID: 101,
  eventType: "gridPlans",
  category: "grid",
  title: "Plans",
  event: "planList",
  cluster: "PLANS",
  dbTable: "api_wf.plans",
  workflows: ["createPlan"],
  purpose: "Display all plans given a specific status",
  // Component layout with explicit mapping
  components: [
    {
      id: "formPlan",
      type: "form",
      event: "formPlan",           // ← Explicit reference to query eventType
      position: { row: 1, col: 1 },
      span: { cols: 1, rows: 1 },
      props: {
        title: "grid.row.name",
        allowCreate: true,
        allowUpdate: true
      }
    }
  ]
}