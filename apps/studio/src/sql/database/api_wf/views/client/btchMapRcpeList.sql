create or replace view btchMapRcpeList as
Select a.prd_rcpe_id 		rcpeID
, a.ingr_ordr 	ingrOrdr
, a.ingr_name		 	ingrName
, a.ingr_id				ingrID
, a.prd_id				prodID	
from whatsfresh.v_prd_rcpe_dtl a
where a.prd_rcpe_actv = 1
order by prd_id, ingr_ordr