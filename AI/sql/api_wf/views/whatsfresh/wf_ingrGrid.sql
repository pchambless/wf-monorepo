CREATE OR REPLACE VIEW api_wf.wf_ingrGrid 
AS
SELECT id, code, name, 
api_wf.f_vendor(default_vendor) default_vendor, 
api_wf.f_measure_unit(default_measure_unit) default_measure, 
ingredient_type_id, account_id
FROM whatsfresh.ingredients 
WHERE  active = 1 
ORDER BY  account_id, name