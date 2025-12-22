create or replace view gridRcpe as
select
  whatsfresh.a.prd_rcpe_id as prodRcpeID,
  whatsfresh.a.ingr_ordr as ingrOrdr,
  whatsfresh.a.ingr_name as ingrName,
  whatsfresh.a.ingr_id as ingrID,
  whatsfresh.a.prd_id as prodID
from
  whatsfresh.v_prd_rcpe_dtl a
where
  (whatsfresh.a.prd_rcpe_actv = 1)
order by
  whatsfresh.a.prd_id,
  whatsfresh.a.ingr_ordr
