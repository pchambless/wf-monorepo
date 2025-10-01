/*
* @view ingrBtchList
* @description Enhanced ingredient batch listing with business intelligence
* @schema api_wf
* @table ingredient_batches
*/
CREATE OR REPLACE VIEW api_wf.ingrBtchList AS
SELECT 
  -- CORE API CONTRACT FIELDS (for CRUD operations)
  ib.id AS ingrBtchID,
  ib.batch_number AS btchNbr,
  ib.vendor_id AS vndrID,
  ib.brand_id AS brndID,
  DATE_FORMAT(ib.purchase_date, '%Y-%m-%d') AS purchDate,
  ib.unit_quantity AS unitQty,
  ib.unit_price AS unitPrice,
  ib.purchase_quantity AS purchQty,
  ib.measure_id AS measID,
  ib.lot_number AS lotNbr,
  DATE_FORMAT(ib.best_by_date, '%Y-%m-%d') AS bestByDate,
  ib.comments AS comments,
  ib.ingredient_id AS ingrID,
  
  -- ENHANCED PURCHASE DETAILS (improved business logic)
  CASE 
    WHEN ib.id IS NOT NULL THEN
      CONCAT(
        ib.purchase_quantity, ' @ $',
        FORMAT(COALESCE(ib.unit_price, 0), 2), ' per ',
        CAST(ib.unit_quantity AS DECIMAL(10,2)), ' ',
        COALESCE(m.abbrev, '')
      )
    ELSE ''
  END AS purch_dtl,
  
  -- BUSINESS INTELLIGENCE FIELDS (for reporting/analytics)
  
  -- Context information
  i.name AS ingrName,
  i.code AS ingrCode,
  it.name AS ingrType,
  
  -- Vendor/Brand names (for reporting)
  v.name AS vndrName,
  b.name AS brndName,
  
  -- Financial calculations
  CAST(
    (COALESCE(ib.unit_price, 0) / NULLIF(ib.unit_quantity, 0))
    AS DECIMAL(13,4)
  ) AS unitRate,
  
  COALESCE(ib.purchase_quantity * ib.unit_price, 0) AS purchAmt,
  
  -- Usage tracking
  COALESCE(pbi.productBatchCount, 0) AS usageCount,
  
  -- Status intelligence
  CASE 
    WHEN COALESCE(pbi.productBatchCount, 0) > 0 THEN 'In Use'
    WHEN ib.best_by_date < CURDATE() THEN 'Expired'
    WHEN ib.best_by_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expiring Soon'
    WHEN ib.purchase_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 'Recently Purchased'
    ELSE 'Available'
  END AS batchStatus,
  
  -- Shop event reference (future integration)
  CASE 
    WHEN ib.shop_event_id IS NOT NULL THEN
      CONCAT('Shop Event #', ib.shop_event_id)
    WHEN ib.purchase_date IS NOT NULL AND v.name IS NOT NULL THEN
      CONCAT(DATE(ib.purchase_date), ' : ', v.name)
    ELSE NULL
  END AS shopEventRef,
  
  -- Account context
  i.account_id AS acctID

FROM whatsfresh.ingredient_batches ib
  INNER JOIN whatsfresh.ingredients i ON ib.ingredient_id = i.id
  INNER JOIN whatsfresh.ingredient_types it ON i.ingredient_type_id = it.id
  LEFT JOIN whatsfresh.vendors v ON ib.vendor_id = v.id AND v.active = 'Y'
  LEFT JOIN whatsfresh.brands b ON ib.brand_id = b.id AND b.active = 'Y'  
  LEFT JOIN whatsfresh.measures m ON ib.measure_id = m.id
  LEFT JOIN (
    SELECT 
      ingredient_batch_id,
      COUNT(*) AS productBatchCount
    FROM whatsfresh.product_batch_ingredients pbi
    JOIN whatsfresh.product_batches pb ON pbi.product_batch_id = pb.id
    WHERE pb.active = 'Y'
    GROUP BY ingredient_batch_id
  ) pbi ON ib.id = pbi.ingredient_batch_id

WHERE ib.active = 1
  AND i.active = 1
  AND it.active = 1
  AND ib.purchase_date >= DATE_SUB(NOW(), INTERVAL 7 YEAR)

ORDER BY ib.purchase_date DESC, ib.batch_number;