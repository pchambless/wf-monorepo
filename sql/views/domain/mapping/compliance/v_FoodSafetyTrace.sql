-- Food Safety Traceability Compliance View
-- Complete ingredient-to-product traceability for regulatory compliance
-- Domain: Mapping & Compliance
CREATE OR REPLACE VIEW v_FoodSafetyTrace AS
SELECT
    -- Traceability Chain Identifier
    CONCAT(
        'TRACE-', pb.account_id, '-', 
        DATE_FORMAT(pb.batch_start, '%Y%m%d'), '-',
        pb.id
    ) AS trace_id,
    
    -- Product Information
    pb.name AS final_product,
    pb.product_type,
    pb.batch_number AS product_batch_number,
    pb.batch_date AS production_date,
    pb.quantity AS product_quantity,
    pb.measure AS product_measure,
    pb.location AS storage_location,
    pb.best_by_date AS product_expiry,
    
    -- Ingredient Traceability
    ib.ingredient_name AS source_ingredient,
    ib.ingredient_type AS ingredient_category,
    ib.batch_number AS ingredient_batch_number,
    ib.lot_number AS supplier_lot_number,
    ib.purchase_date AS ingredient_received_date,
    ib.best_by_date AS ingredient_expiry,
    
    -- Supplier Information
    ib.vendor AS supplier_name,
    ib.brand AS ingredient_brand,
    
    -- Usage Information
    pbi.quantity_used,
    pbi.measure_unit AS usage_measure,
    pr.ingredient_order_in_recipe,
    
    -- Regulatory Fields
    DATEDIFF(pb.best_by_date, pb.batch_date) AS product_shelf_life_days,
    DATEDIFF(ib.best_by_date, ib.purchase_date) AS ingredient_shelf_life_days,
    
    -- Risk Assessment
    CASE 
        WHEN ib.best_by_date < pb.batch_date THEN 'EXPIRED INGREDIENT USED'
        WHEN ib.best_by_date <= DATE_ADD(pb.batch_date, INTERVAL 7 DAY) THEN 'NEAR EXPIRY RISK'
        WHEN pb.best_by_date < CURDATE() THEN 'EXPIRED PRODUCT'
        ELSE 'COMPLIANT'
    END AS compliance_status,
    
    -- Audit Trail
    pb.created_at AS product_batch_created,
    ib.created_at AS ingredient_batch_created,
    pbi.created_at AS mapping_created,
    
    -- Account Information
    a.name AS company_name,
    pb.account_id

FROM v_PrdBtchList pb
    INNER JOIN product_batch_ingredients pbi ON pb.id = pbi.product_batch_id
    INNER JOIN v_IngrBtchList ib ON pbi.ingredient_batch_id = ib.id
    INNER JOIN product_recipes pr ON pbi.product_recipe_id = pr.id
        AND pr.product_id = pb.product_id
        AND pr.ingredient_id = ib.ingredient_id
    INNER JOIN accounts a ON pb.account_id = a.id AND a.active = 1

WHERE pb.active = 1
    AND ib.active = 1

ORDER BY 
    pb.batch_date DESC,
    pb.product_name,
    pr.ingredient_order_in_recipe,
    ib.ingredient_name;

-- Note: This view provides complete traceability for:
-- - FDA recalls and investigations
-- - USDA compliance audits  
-- - Internal quality control
-- - Supplier performance tracking
-- - Shelf life validation