-- Enhanced Product Batch Details Foundation View
-- Optimized version of v_prd_btch_dtl with improved performance and maintainability
-- Domain: Product Management
CREATE OR REPLACE VIEW v_PrdBtchDetails AS
SELECT
    -- Unique Identifier
    ROW_NUMBER() OVER (ORDER BY prd.account_id, pb.batch_start DESC, pb.batch_number) AS uid,
    
    -- Product Information
    CONCAT(prd.name, ' (', pt.name, ')') AS product_type_and_name,
    prd.name AS product_name,
    prd.code AS product_code,
    pt.name AS product_type,
    prd.upc_code,
    prd.description AS product_description,
    
    -- Recipe Information
    prd.recipe_quantity,
    rm.abbreviation AS recipe_measure_unit,
    rm.name AS recipe_measure_name,
    pb.recipe_multiply_factor,
    
    -- Batch Mapping Statistics
    COALESCE(ingr_stats.ingredient_mappings, 0) AS ingredient_mappings,
    COALESCE(task_stats.task_mappings, 0) AS task_mappings,
    COALESCE(ingr_stats.ingredient_mappings, 0) + COALESCE(task_stats.task_mappings, 0) AS total_mappings,
    
    -- Batch Information
    COALESCE(pb.batch_number, 'No Batches') AS batch_number,
    pb.location,
    pb.batch_quantity,
    bm.abbreviation AS batch_measure_unit,
    bm.name AS batch_measure_name,
    
    -- Formatted Batch Quantity
    CASE 
        WHEN pb.batch_quantity IS NOT NULL AND bm.abbreviation IS NOT NULL THEN
            CONCAT(pb.batch_quantity, ' ', bm.abbreviation)
        ELSE ''
    END AS quantity_with_measure,
    
    -- Dates
    DATE(pb.batch_start) AS batch_date,
    pb.batch_start AS batch_start_timestamp,
    DATE(pb.best_by_date) AS best_by_date,
    
    -- Additional Information
    pb.comments,
    
    -- Active Status Flags
    prd.active AS product_active,
    COALESCE(pb.active, 1) AS batch_active,
    pt.active AS product_type_active,
    
    -- IDs for Joins
    prd.account_id,
    prd.product_type_id,
    prd.id AS product_id,
    pb.id AS product_batch_id,
    pb.global_measure_unit_id AS batch_measure_unit_id,
    prd.global_measure_unit_id AS recipe_measure_unit_id,
    
    -- Audit Information
    pb.created_at AS batch_created_at,
    pb.updated_at AS batch_updated_at,
    prd.created_at AS product_created_at

FROM products prd
    INNER JOIN product_types pt ON prd.product_type_id = pt.id
    LEFT JOIN product_batches pb ON prd.id = pb.product_id AND pb.active = 1
    LEFT JOIN measures rm ON prd.global_measure_unit_id = rm.id AND rm.active = 1
    LEFT JOIN measures bm ON pb.global_measure_unit_id = bm.id AND bm.active = 1
    LEFT JOIN (
        SELECT 
            product_batch_id, 
            COUNT(*) AS ingredient_mappings
        FROM product_batch_ingredients pbi
        JOIN ingredient_batches ib ON pbi.ingredient_batch_id = ib.id
        WHERE ib.active = 1
        GROUP BY product_batch_id
    ) ingr_stats ON pb.id = ingr_stats.product_batch_id
    LEFT JOIN (
        SELECT 
            product_batch_id, 
            COUNT(*) AS task_mappings
        FROM product_batch_tasks pbt
        JOIN tasks t ON pbt.task_id = t.id
        WHERE t.active = 1
        GROUP BY product_batch_id
    ) task_stats ON pb.id = task_stats.product_batch_id

WHERE prd.active = 1 
    AND pt.active = 1

ORDER BY 
    prd.account_id,
    pb.batch_start DESC NULLS LAST,
    pb.batch_number;

-- Suggested indexes for optimal performance:
-- CREATE INDEX idx_product_batches_product_active ON product_batches(product_id, active);
-- CREATE INDEX idx_product_batches_batch_start ON product_batches(batch_start DESC, active);
-- CREATE INDEX idx_product_batch_ingredients_batch_id ON product_batch_ingredients(product_batch_id);
-- CREATE INDEX idx_product_batch_tasks_batch_id ON product_batch_tasks(product_batch_id);