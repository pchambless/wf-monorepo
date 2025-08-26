export const vndrList = {
  eventID: 31,
  category: "page:CrudLayout",
  title: "Vendors",
  cluster: "REFERENCE",
  routePath: "/vendors/:acctID/vndrList",
  dbTable: "vendors",
  selWidget: "SelVndr",
  navChildren: [],
  method: "GET",
  qrySQL: `
      SELECT *
      FROM api_wf.vndrList
      WHERE acctID = :acctID
      ORDER BY vndrName
    `,
  params: [":acctID"],
  primaryKey: "vndrID",
  purpose: "Get vendors for an account"
};