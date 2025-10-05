export const userLogin =  {
    eventID: 1,
    eventType: "userLogin",
    category: "page:Login", 
    cluster: "AUTH", 
    dbTable: "users", 
    routePath: "/login",
    children: ["acctList", "userList"], // Login leads to account selection
    method: "GET",
    qrySQL: `
      SELECT *, :enteredPassword
      FROM api_wf.userList
      WHERE userEmail = :userEmail
    `,
    params: [":userEmail", ":enteredPassword"],
    purpose: "Authenticate user login"
  };