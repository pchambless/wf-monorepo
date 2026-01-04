CREATE
OR REPLACE VIEW wf_ingrGrid AS
SELECT
whatsfresh.ingredients.id AS id,
whatsfresh.ingredients.code AS code,
whatsfresh.ingredients.name AS name,
api_wf.f_vendor(whatsfresh.ingredients.default_vendor) AS default_vendor,
api_wf.f_measure_unit(whatsfresh.ingredients.default_measure_unit) AS default_measure,
whatsfresh.ingredients.ingredient_type_id AS ingredient_type_id,
whatsfresh.ingredients.account_id AS account_id
FROM whatsfresh.ingredients
WHERE (whatsfresh.ingredients.active = 1)
ORDER BY whatsfresh.ingredients.account_id,
whatsfresh.ingredients.name;
