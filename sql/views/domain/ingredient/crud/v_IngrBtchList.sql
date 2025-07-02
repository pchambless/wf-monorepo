-- Enhanced Ingredient Batch List CRUD View
-- Combines CRUD simplicity with foundation view business logic
-- Domain: Ingredient Management
CREATE OR REPLACE VIEW v_IngrBtchList AS
SELECT
    -- Primary identifier
    ibd.ingredient_batch_id AS id,
    
    -- Core display fields (API-ready)
    ibd.ingredient_name AS name,
    ibd.batch_number,
    ibd.lot_number,
    ibd.purchase_date,
    ibd.best_by_date,
    
    -- Quantity and pricing (simplified)
    ibd.purchase_quantity AS quantity,
    ibd.purchase_measure_unit AS measure,
    ibd.unit_price,
    ibd.purchase_amount,
    
    -- Relationships
    ibd.vendor_name AS vendor,
    ibd.brand_name AS brand,
    ibd.ingredient_type,
    
    -- Usage analytics (from foundation view)
    ibd.product_batch_count AS usage_count,
    CASE 
        WHEN ibd.product_batch_count > 0 THEN 'In Use'
        WHEN ibd.best_by_date < CURDATE() THEN 'Expired'
        WHEN ibd.best_by_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expiring Soon'
        ELSE 'Available'
    END AS status,
    
    -- Comments
    ibd.comments,
    
    -- Active status
    ibd.batch_active AS active,
    
    -- IDs for relationships
    ibd.account_id,
    ibd.ingredient_id,
    ibd.vendor_id,
    ibd.brand_id,
    
    -- Audit info
    ibd.batch_created_at AS created_at,
    ibd.batch_updated_at AS updated_at

FROM v_IngrBtchDetails ibd
WHERE ibd.batch_active = 1
    AND ibd.ingredient_active = 1
    AND ibd.batch_number != 'No Batches'

ORDER BY 
    ibd.purchase_date DESC,
    ibd.ingredient_name,
    ibd.batch_number;