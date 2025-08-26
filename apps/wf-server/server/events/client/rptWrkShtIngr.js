export const rptWrkShtIngr = {
  eventID: 300,
  category: "report:worksheet",
  title: "Worksheet Ingredients",
  cluster: "REPORTS",
  method: "GET",
  qrySQL: `
      SELECT ingr_ordr Ordr, 
             ingr_name Ingredient, 
             ingrMaps 'Ingr Batch(es): Vendor', 
             prd_ingr_desc Description
      FROM whatsfresh.v_prdBtchIngr_Map
      WHERE prd_btch_id = :prodBtchID
      ORDER BY ingr_ordr
    `,
  params: [":prodBtchID"],
  primaryKey: "ingr_ordr",
  purpose: "Worksheet ingredients section data"
};