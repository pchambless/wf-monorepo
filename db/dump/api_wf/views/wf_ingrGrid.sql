create or replace view wf_ingrGrid as
select
  whatsfresh.ingredients.id as id,
  whatsfresh.ingredients.code as code,
  whatsfresh.ingredients.name as name,
  api_wf.f_vendor (whatsfresh.ingredients.default_vendor) as default_vendor,
  api_wf.f_measure_unit (whatsfresh.ingredients.default_measure_unit) as default_measure,
  whatsfresh.ingredients.ingredient_type_id as ingredient_type_id,
  whatsfresh.ingredients.account_id as account_id
from
  whatsfresh.ingredients
where
  (whatsfresh.ingredients.active = 1)
order by
  whatsfresh.ingredients.account_id,
  whatsfresh.ingredients.name
