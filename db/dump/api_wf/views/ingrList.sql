create or replace view ingrList as
select
  a.id as ingrID,
  a.name as ingrName,
  a.code as ingrCode,
  a.description as ingrDesc,
  a.default_measure_unit as measID,
  a.default_vendor as vndrID,
  a.grams_per_ounce as ingrGrmsPerOz,
  a.ingredient_type_id as ingrTypeID,
  a.account_id as acctID
from
  whatsfresh.ingredients a
order by
  a.ingredient_type_id,
  a.name
