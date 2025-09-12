-- Enhanced Ingredient Batch Details Foundation View
-- Optimized version of v_ingr_btch_dtl with improved performance and maintainability
-- Domain: Ingredient Management
CREATE OR REPLACE VIEW v_IngrBtchDetails AS
SELECT
    -- Ingredient Information
    it.name AS ingredient_type,
    i.name AS ingredient_name,
    i.code AS ingredient_code,
    i.grams_per_ounce,
    i.description AS ingredient_description,
    i.default_measure_unit AS default_measure_id,
    i.default_vendor AS default_vendor_id,
    
    -- Batch Information
    COALESCE(ib.batch_number, 'No Batches') AS batch_number,
    COALESCE(ib.lot_number, '') AS lot_number,
    DATE(ib.purchase_date) AS purchase_date,
    ib.purchase_quantity,
    
    -- Measurement and Pricing
    m.abbreviation AS purchase_measure_unit,
    m.name AS purchase_measure_name,
    ib.unit_quantity,
    ib.unit_price,
    CAST(
        (COALESCE(ib.unit_price, 0) / NULLIF(ib.unit_quantity, 0))
        AS DECIMAL(13,4)
    ) AS unit_rate,
    
    -- Purchase Details (Formatted)
    CASE 
        WHEN ib.id IS NOT NULL THEN
            CONCAT(
                ib.purchase_quantity, ' @ $',
                FORMAT(COALESCE(ib.unit_price, 0), 2), ' per ',
                CAST(ib.unit_quantity AS DECIMAL(10,2)), ' ',
                m.abbreviation
            )
        ELSE ''
    END AS purchase_details,
    
    -- Purchase Amounts
    CONCAT('$', FORMAT(
        COALESCE(ib.purchase_quantity * ib.unit_price, 0), 2
    )) AS purchase_amount_formatted,
    COALESCE(ib.purchase_quantity * ib.unit_price, 0) AS purchase_amount,
    
    -- Vendor and Brand Information
    v.name AS vendor_name,
    b.name AS brand_name,
    
    -- Dates
    DATE(ib.best_by_date) AS best_by_date,
    
    -- Usage Statistics
    COALESCE(pbi.product_batch_count, 0) AS product_batch_count,
    
    -- Additional Information
    ib.comments,
    
    -- Shop Event (Future Integration)
    CASE 
        WHEN ib.shop_event_id IS NOT NULL THEN
            CONCAT('Shop Event #', ib.shop_event_id)
        WHEN ib.purchase_date IS NOT NULL AND v.name IS NOT NULL THEN
            CONCAT(DATE(ib.purchase_date), ' : ', v.name)
        ELSE NULL
    END AS shop_event_reference,
    
    -- Active Status Flags
    i.active AS ingredient_active,
    COALESCE(ib.active, 1) AS batch_active,
    it.active AS ingredient_type_active,
    
    -- IDs for Joins
    i.account_id,
    ib.id AS ingredient_batch_id,
    i.id AS ingredient_id,
    it.id AS ingredient_type_id,
    ib.vendor_id,
    ib.brand_id,
    ib.measure_id AS measure_id,
    ib.shop_event_id,
    
    -- Audit Information
    ib.created_at AS batch_created_at,
    ib.updated_at AS batch_updated_at

FROM ingredients i
    LEFT JOIN ingredient_types it ON i.ingredient_type_id = it.id
    LEFT JOIN ingredient_batches ib ON i.id = ib.ingredient_id
        AND ib.active = 1
        AND ib.purchase_date >= DATE_SUB(NOW(), INTERVAL 7 YEAR) -- Performance optimization
    LEFT JOIN vendors v ON ib.vendor_id = v.id AND v.active = 1
    LEFT JOIN brands b ON ib.brand_id = b.id AND b.active = 1
    LEFT JOIN measures m ON ib.measure_id = m.id AND m.active = 1
    LEFT JOIN (
        SELECT 
            ingredient_batch_id,
            COUNT(*) AS product_batch_count
        FROM product_batch_ingredients pbi
        JOIN product_batches pb ON pbi.product_batch_id = pb.id
        WHERE pb.active = 1
        GROUP BY ingredient_batch_id
    ) pbi ON ib.id = pbi.ingredient_batch_id

WHERE i.active = 1 
    AND it.active = 1;

-- Suggested indexes for optimal performance:
-- CREATE INDEX idx_ingredient_batches_purchase_date ON ingredient_batches(purchase_date, active);
-- CREATE INDEX idx_ingredient_batches_ingredient_active ON ingredient_batches(ingredient_id, active);
-- CREATE INDEX idx_product_batch_ingredients_batch_id ON product_batch_ingredients(ingredient_batch_id);