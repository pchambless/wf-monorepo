create or replace view gridRcpe as 
Select a.prd_rcpe_id prodRcpeID
, a.ingr_ordr ingrOrdr
, a.ingr_name ingrName
, a.ingr_id ingrID
, prd_id	prodID
from whatsfresh.v_prd_rcpe_dtl a
where a.prd_rcpe_actv = 'Y'
order by a.prd_id, a.ingr_ordr