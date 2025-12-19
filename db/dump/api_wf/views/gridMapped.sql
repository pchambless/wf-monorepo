create or replace view gridMapped as
select
  whatsfresh.a.prd_btch_ingr_id as mapID,
  whatsfresh.a.ingr_btch_nbr as ingrBtchNbr,
  whatsfresh.a.purch_date as purchDate,
  whatsfresh.a.vndr_name as vndrName,
  whatsfresh.a.prd_rcpe_id as prodRcpeID,
  whatsfresh.a.ingr_id as ingrID,
  whatsfresh.a.prd_btch_id as prodBtchID
from
  whatsfresh.v_prd_btch_ingr_dtl a
order by
  whatsfresh.a.purch_date desc
