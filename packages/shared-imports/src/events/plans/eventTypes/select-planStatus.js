/**
 * select plan status event type
 * populates the select dropdown for plan status
 * used in plan management and plan detail tabs
 */
export const selectPlanStatus = {
  eventID: 100.6,
  eventType: "select-PlanStatus",
  category: "ui:Select",
  title: "Status",
  cluster: "PLANS",
  method: "CONFIG",
  configKey: "planStatus",
  configOptions: { sortByOrder: true },
  navChildren: ["grid-planList"],
  purpose: "Filter plans by status selection",
};
