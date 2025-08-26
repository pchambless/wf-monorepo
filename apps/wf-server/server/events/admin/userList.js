export const userList =  {
    eventID: 62,
    eventType: "userList",
    category: "page:Crud",
    cluster: "ADMIN",
    dbTable: "users", // Add this line
    routePath: "/userList",
    selWidget: "SelUser",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.userList
      ORDER BY userName
    `,
    params: [],
    purpose: "Get whatsfresh user list"
  };