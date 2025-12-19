create or replace view rcpeList as
select
  whatsfresh.a.prd_rcpe_id as rcpeID,
  whatsfresh.a.ingr_ordr as ingrOrdr,
  whatsfresh.a.ingr_name as ingrName,
  whatsfresh.a.ingr_qty_meas as qtyMeas,
  whatsfresh.a.prd_id as prodID,
  whatsfresh.a.ingr_type_id as ingrTypeSel,
  whatsfresh.a.ingr_id as ingrSel,
  whatsfresh.a.ingr_meas_id as measID,
  whatsfresh.a.ingr_qty as Qty,
  whatsfresh.a.prd_ingr_desc as Comments
from
  whatsfresh.v_prd_rcpe_dtl a
order by
  whatsfresh.a.prd_id,
  whatsfresh.a.ingr_ordr
