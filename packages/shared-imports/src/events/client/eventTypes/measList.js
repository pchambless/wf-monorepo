export const measList = {
    eventID: 63,
    eventType: "measList",
    category: "page:CrudLayout",
    title: "Measures",
    cluster: "REFERENCE",
    routePath: "/measures/:acctID/measList",
    dbTable: "measures",
    selWidget: "SelMeas",
    navChildren: [],
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.measList
      WHERE acctID = :acctID
      ORDER BY name
    `,
    params: [":acctID"],
    primaryKey: "measID",
    purpose: "Get measurement units"
  };