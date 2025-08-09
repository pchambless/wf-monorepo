export const taskList = {
    eventID: 41,
    eventType: "taskList",
    category: "page:CrudLayout",
    title: "Product Types Tasks",
    cluster: "PRODUCTS",
    routePath: "/products/:prodTypeID/taskList",
    dbTable: "tasks",
    selWidget: "SelTask",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.taskList
      WHERE prodTypeID = :prodTypeID
      ORDER BY taskID DESC
    `,
    params: [":prodTypeID"],
    primaryKey: "taskID",
    purpose: "Get tasks for batches"
  };