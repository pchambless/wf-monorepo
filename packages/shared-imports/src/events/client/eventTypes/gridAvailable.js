export const gridAvailable = {
    eventID: 103,
    eventType: "gridAvailable",
    category: "ui:Grid",
    cluster: "MAPPING",
    method: "GET",
    qrySQL: `
      select a.ingr_btch_id ingrBtchID, ingr_name ingrName, a.ingr_btch_nbr ingrBtchNbr
      , a.purch_date purchDate, a.vndr_name vndrName, a.ingr_id ingrID
      from v_ingr_btch_dtl a
      where a.ingr_id = :ingrID 
      and a.ingr_btch_id not in 
      (select ingr_btch_id 
      from v_prd_btch_ingr_dtl 
      where prd_btch_id = :prodBtchID 
      and ingr_id = :ingrID) 
      order by ingr_btch_id desc
      limit 20
    `,
    params: [":prodBtchID", ":ingrID"],
    primaryKey: "ingrBtchID",
    purpose: "Ingr batches available to map to a product batch"
  };