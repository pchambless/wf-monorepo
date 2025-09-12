create or replace view v_prd_rcpe_active
as
select 
  a.prd_type_n_name
, a.ingr_ordr
, a.ingr_name
, a.ingr_qty_meas
, a.prd_ingr_desc
, a.prd_id
, a.ingr_id
, a.acct_id
, a.prd_rcpe_id
from v_prd_rcpe_dtl a
where a.prd_rcpe_actv = 1