export const rptWrkShtTask = {
  eventID: 301,
  category: "report:worksheet",
  title: "Worksheet Tasks",
  cluster: "REPORTS",
  method: "GET",
  qrySQL: `
      SELECT ordr Ordr, 
             task_name Task, 
             taskWrkrs Workers, 
             measure_value Measure, 
             comments Comments
      FROM whatsfresh.v_prd_btch_task_dtl
      WHERE prd_btch_id = :prodBtchID
      ORDER BY ordr
    `,
  params: [":prodBtchID"],
  primaryKey: "ordr",
  purpose: "Worksheet tasks section data"
};