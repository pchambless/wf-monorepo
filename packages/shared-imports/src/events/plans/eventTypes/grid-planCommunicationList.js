export const gridPlanCommunicationList =
{
    eventID: 102,
    eventType: "grid-planCommunicationList",
    category: "grid",
    title: "Communications",
    cluster: "PLANS",
    workflows: ["createCommunication"],

    // Standard 3-trigger pattern
    workflowTriggers: {
        onSelect: ["validateAccess", "refreshContext"],
        onUpdate: ["updateRecord", "trackImpact"],
        onCreate: ["createRecord", "trackImpact"],
    },

    dbTable: "api_wf.plan_communications",
    method: "GET",
    qrySQL: `
        SELECT *
        FROM api_wf.plan_communications
        WHERE plan_id = :planID
        ORDER BY created_at DESC
      `,
    params: [":planID"],
    primaryKey: "id",
    purpose: "Get communications for a specific plan",
}
    ;