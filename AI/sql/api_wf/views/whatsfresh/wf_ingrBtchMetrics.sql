CREATE OR REPLACE VIEW api_wf.wf_ingrBtchMetrics AS
SELECT
    a.ingrTypeName,
    a.ingrName,
    a.ingrCode,
    a.ingrDesc,
    a.gmsPerOz,
    COALESCE(rcpe.rcpeCnt, 0) AS recipes,
    COUNT(a.ingredient_batch_id) AS batches,
    -- ... rest of aggregations ...
    -- IDs with full names
    a.ingredient_type_id,
    a.ingredient_id,
    a.account_id,
    a.ingrActv AS ingrActv
  FROM api_wf.wf_ingrBtchDtl a  -- Just change this line!
  LEFT JOIN (
    SELECT ingredient_id, COUNT(*) AS rcpeCnt
    FROM whatsfresh.product_recipes
    WHERE active = 'Y'
    GROUP BY ingredient_id
  ) rcpe ON a.ingredient_id = rcpe.ingredient_id
GROUP BY
  a.ingrTypeName,
  a.ingrName,
  a.ingrCode,
  a.ingrDesc,
  a.gmsPerOz,
  a.ingredient_type_id,
  a.ingredient_id,
  a.account_id,
  a.ingrActv
ORDER BY
  a.account_id,
  a.ingrTypeName,
  a.ingrName;
