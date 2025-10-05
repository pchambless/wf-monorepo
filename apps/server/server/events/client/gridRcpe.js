export const gridRcpe = {
  eventID: 101,
  category: "data:Grid",
  cluster: "MAPPING",
  method: "GET",
  qrySQL: `
      SELECT * 
      from api_wf.gridRcpe a
      WHERE prodID = :prodID
      ORDER BY a.ingrOrdr
    `,
  params: [":prodID"],
  primaryKey: "prodRcpeID",
  purpose: "Get recipe ingredients for a product"
};