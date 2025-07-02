-- Enhanced Product Batch List CRUD View
-- Combines CRUD simplicity with foundation view business logic
-- Domain: Product Management
CREATE OR REPLACE VIEW v_PrdBtchList AS
SELECT
    -- Primary identifier
    pbd.product_batch_id AS id,
    
    -- Core display fields (API-ready)
    pbd.product_name AS name,
    pbd.product_type,
    pbd.batch_number,
    pbd.batch_date,
    pbd.best_by_date,
    
    -- Quantity and location
    pbd.batch_quantity AS quantity,
    pbd.batch_measure_unit AS measure,
    pbd.quantity_with_measure AS quantity_display,
    pbd.location,
    
    -- Recipe information
    pbd.recipe_quantity,
    pbd.recipe_measure_unit,
    pbd.recipe_multiply_factor,
    
    -- Mapping statistics (from foundation view)
    pbd.ingredient_mappings,
    pbd.task_mappings,
    pbd.total_mappings,
    
    -- Status indicators
    CASE 
        WHEN pbd.total_mappings = 0 THEN 'Setup Required'
        WHEN pbd.ingredient_mappings = 0 THEN 'Missing Ingredients'
        WHEN pbd.task_mappings = 0 THEN 'Missing Tasks'
        WHEN pbd.best_by_date < CURDATE() THEN 'Expired'
        WHEN pbd.best_by_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY) THEN 'Expiring Soon'
        ELSE 'Ready'
    END AS status,
    
    -- Comments
    pbd.comments,
    
    -- Active status
    pbd.batch_active AS active,
    
    -- IDs for relationships
    pbd.account_id,
    pbd.product_id,
    pbd.product_type_id,
    
    -- Audit info
    pbd.batch_created_at AS created_at,
    pbd.batch_updated_at AS updated_at

FROM v_PrdBtchDetails pbd
WHERE pbd.batch_active = 1
    AND pbd.product_active = 1
    AND pbd.batch_number != 'No Batches'

ORDER BY 
    pbd.batch_date DESC,
    pbd.product_name,
    pbd.batch_number;