-- Enhanced Batch Traceability Foundation View
-- Optimized version of v_btch_trace with improved performance and maintainability
-- Domain: Batch Mapping & Traceability
CREATE OR REPLACE VIEW v_BatchTraceability AS
SELECT
    -- Account Information
    a.name AS account_name,
    
    -- Batch Classification
    batch_data.batch_category,
    CONCAT(batch_data.batch_type, '.', batch_data.batch_name) AS batch_identifier,
    batch_data.batch_number,
    DATE(batch_data.batch_date) AS batch_date,
    batch_data.batch_date AS batch_timestamp,
    
    -- Additional Traceability Information
    batch_data.location,
    batch_data.quantity,
    batch_data.measure_unit,
    batch_data.vendor_brand_info,
    
    -- Status Information
    batch_data.active_status,
    
    -- IDs for Joins
    batch_data.account_id,
    batch_data.batch_id,
    batch_data.type_id,
    batch_data.entity_id

FROM (
    -- Ingredient Batches
    SELECT
        'Ingredient' AS batch_category,
        ibd.ingredient_type AS batch_type,
        ibd.ingredient_name AS batch_name,
        ibd.batch_number,
        ibd.purchase_date AS batch_date,
        ibd.account_id,
        ibd.ingredient_batch_id AS batch_id,
        ibd.ingredient_type_id AS type_id,
        ibd.ingredient_id AS entity_id,
        '' AS location,
        CONCAT(
            COALESCE(ibd.purchase_quantity, 0), ' ',
            COALESCE(ibd.purchase_measure_unit, '')
        ) AS quantity,
        ibd.purchase_measure_unit AS measure_unit,
        CASE 
            WHEN ibd.vendor_name IS NOT NULL AND ibd.brand_name IS NOT NULL THEN
                CONCAT(ibd.vendor_name, ' / ', ibd.brand_name)
            WHEN ibd.vendor_name IS NOT NULL THEN
                ibd.vendor_name
            WHEN ibd.brand_name IS NOT NULL THEN
                ibd.brand_name
            ELSE ''
        END AS vendor_brand_info,
        CASE 
            WHEN ibd.ingredient_active = 1 AND ibd.batch_active = 1 THEN 'Active'
            ELSE 'Inactive'
        END AS active_status
    FROM v_IngrBtchDetails ibd
    WHERE ibd.purchase_date >= DATE_SUB(NOW(), INTERVAL 5 YEAR) -- Configurable time range
        AND ibd.batch_number != 'No Batches'
    
    UNION ALL
    
    -- Product Batches  
    SELECT
        'Product' AS batch_category,
        pbd.product_type AS batch_type,
        pbd.product_name AS batch_name,
        pbd.batch_number,
        pbd.batch_start_timestamp AS batch_date,
        pbd.account_id,
        pbd.product_batch_id AS batch_id,
        pbd.product_type_id AS type_id,
        pbd.product_id AS entity_id,
        COALESCE(pbd.location, '') AS location,
        CONCAT(
            COALESCE(pbd.batch_quantity, 0), ' ',
            COALESCE(pbd.batch_measure_unit, '')
        ) AS quantity,
        pbd.batch_measure_unit AS measure_unit,
        CASE 
            WHEN pbd.ingredient_mappings > 0 THEN
                CONCAT(pbd.ingredient_mappings, ' ingredients')
            ELSE 'No ingredients mapped'
        END AS vendor_brand_info,
        CASE 
            WHEN pbd.product_active = 1 AND pbd.batch_active = 1 THEN 'Active'
            ELSE 'Inactive'
        END AS active_status
    FROM v_PrdBtchDetails pbd
    WHERE pbd.batch_start_timestamp >= DATE_SUB(NOW(), INTERVAL 5 YEAR) -- Configurable time range
        AND pbd.batch_number != 'No Batches'
        
) batch_data
LEFT JOIN accounts a ON batch_data.account_id = a.id AND a.active = 1

ORDER BY 
    batch_data.batch_date DESC,
    batch_data.batch_category,
    batch_data.batch_type,
    batch_data.batch_name,
    batch_data.batch_number;

-- Suggested indexes for optimal performance:
-- CREATE INDEX idx_ingredient_batches_trace ON ingredient_batches(purchase_date, active, batch_number);
-- CREATE INDEX idx_product_batches_trace ON product_batches(batch_start, active, batch_number);
-- CREATE INDEX idx_accounts_active ON accounts(active, name);