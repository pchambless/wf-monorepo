/**
  * Plan Management Event Types
  * Event definitions for plan, communication, impact, and document management
  */

const PLAN_EVENTS = [
    // PLANS
    {
        eventID: 101,
        eventType: "planList",
        category: "page:CrudLayout",
        title: "Plans",
        cluster: "PLANS",
        routePath: "/plans/planList",
        dbTable: "api_wf.plans",
        selWidget: "SelPlan",
        method: "GET",
        qrySQL: `
        SELECT id, cluster, name, status, priority, description, created_by, assigned_to, started_at, completed_at, created_at
        FROM api_wf.plans
        WHERE deleted_at IS NULL
        ORDER BY id DESC
      `,
        params: [],
        primaryKey: "id",
        purpose: "Get all plans for management"
    },

    {
        eventID: 102,
        eventType: "planCommunicationList",
        category: "page:CrudLayout",
        title: "Plan Communications",
        cluster: "PLANS",
        routePath: "/plans/:planID/communications",
        dbTable: "api_wf.plan_communications",
        method: "GET",
        qrySQL: `
        SELECT id, plan_id, from_agent, to_agent, type, subject, message, status, created_at
        FROM api_wf.plan_communications
        WHERE plan_id = :planID
        ORDER BY created_at DESC
      `,
        params: [":planID"],
        primaryKey: "id",
        purpose: "Get communications for a specific plan"
    },

    {
        eventID: 103,
        eventType: "planImpactList",
        category: "page:CrudLayout",
        title: "Plan Impacts",
        cluster: "PLANS",
        routePath: "/plans/:planID/impacts",
        dbTable: "api_wf.plan_impacts",
        method: "GET",
        qrySQL: `
        SELECT id, plan_id, file_path, change_type, status, description, created_at, created_by
        FROM api_wf.plan_impacts
        WHERE plan_id = :planID
        ORDER BY created_at DESC
      `,
        params: [":planID"],
        primaryKey: "id",
        purpose: "Get file impacts for a specific plan"
    },

    {
        eventID: 104,
        eventType: "planDocumentList",
        category: "page:CrudLayout",
        title: "Plan Documents",
        cluster: "PLANS",
        routePath: "/plans/:planID/documents",
        dbTable: "api_wf.plan_documents",
        method: "GET",
        qrySQL: `
        SELECT id, plan_id, document_type, file_path, title, author, status, created_at
        FROM api_wf.plan_documents
        WHERE plan_id = :planID
        ORDER BY created_at DESC
      `,
        params: [":planID"],
        primaryKey: "id",
        purpose: "Get documents for a specific plan"
    }
];

/**
 * Get event by eventType
 */
const getPlanEventType = (eventType) => {
    return PLAN_EVENTS.find(event => event.eventType === eventType);
};

// ES module exports
export {
    PLAN_EVENTS,
    getPlanEventType
};