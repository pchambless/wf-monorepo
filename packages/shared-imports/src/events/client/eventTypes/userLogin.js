export const userLogin =   {
    eventID: 1,
    eventType: "userLogin",
    category: "page:AuthLayout",
    cluster: "AUTH",
    routePath: "/login",
    dbTable: "users", // Add this line
    children: ["userAcctList"],
    navChildren: ["dashboard"],
    method: "GET",
    qrySQL: `
      SELECT *, :enteredPassword
      FROM api_wf.userList
      WHERE userEmail = :userEmail
    `,
    params: [":userEmail", ":enteredPassword"],
    purpose: "Authenticate user login"
  };