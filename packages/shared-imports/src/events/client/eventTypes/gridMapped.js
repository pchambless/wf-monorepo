export const gridMapped = {
    eventID: 102,
    eventType: "gridMapped",
    category: "ui:Grid",
    cluster: "MAPPING",
    method: "GET",
    qrySQL: `
      SELECT *
      FROM api_wf.gridMapped a
      WHERE a.ingrID = :ingrID
      AND a.prodBtchID = :prodBtchID
      ORDER BY purchDate DESC
    `,
    params: [":prodBtchID", ":ingrID", "prodRcpeID"],
    primaryKey: "mapID",
    purpose: "Ingr batches mapped to a product batch"
  };