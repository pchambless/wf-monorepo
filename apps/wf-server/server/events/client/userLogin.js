export const userLogin = {
  eventID: 1,
  category: "page:AuthLayout",
  cluster: "AUTH",
  routePath: "/login",
  dbTable: "users", // Add this line
  children: ["userAcctList"],
  navChildren: ["dashboard"],
  method: "GET",
  qrySQL: `
      SELECT *
      FROM api_wf.userList
      WHERE userEmail = :userEmail
    `,
  params: [":userEmail"],
  purpose: "Authenticate user login"
};