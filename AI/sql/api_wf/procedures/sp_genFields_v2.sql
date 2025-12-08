DROP PROCEDURE IF EXISTS `api_wf`.`sp_genFields`;

DELIMITER $$

CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_genFields`(
    IN p_xref_id INT
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    DECLARE v_schema_name VARCHAR(100);
    DECLARE v_component_type VARCHAR(20);
    DECLARE v_qry_sql TEXT;
    DECLARE v_full_table_name VARCHAR(200);
    DECLARE v_select_clause TEXT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_column_expr VARCHAR(500);
    DECLARE v_column_alias VARCHAR(100);
    DECLARE v_actual_column VARCHAR(100);
    
    -- Temporary table to store parsed columns
    DROP TEMPORARY TABLE IF EXISTS temp_parsed_columns;
    CREATE TEMPORARY TABLE temp_parsed_columns (
        column_alias VARCHAR(100),
        actual_column VARCHAR(100),
        is_function BOOLEAN DEFAULT FALSE
    );

    -- Get component details from vw_eventSQL
    SELECT a.comp_type, a.qrySQL
    INTO v_component_type, v_qry_sql
    FROM vw_eventSQL a
    WHERE a.xref_id = p_xref_id;

    -- Extract SELECT clause (between SELECT and FROM)
    SET v_select_clause = SUBSTRING_INDEX(SUBSTRING_INDEX(LOWER(v_qry_sql), 'from ', 1), 'select ', -1);
    SET v_select_clause = REPLACE(REPLACE(REPLACE(v_select_clause, '\r\n', ' '), '\n', ' '), '\t', ' ');
    SET v_select_clause = TRIM(v_select_clause);

    -- Extract FROM clause for table name
    SET @from_pos = LOCATE('from ', LOWER(v_qry_sql));
    IF @from_pos > 0 THEN
        SET v_full_table_name = SUBSTRING(v_qry_sql, @from_pos + 5);
        SET v_full_table_name = REPLACE(REPLACE(REPLACE(v_full_table_name, '\r\n', ' '), '\n', ' '), '\t', ' ');
        SET v_full_table_name = TRIM(SUBSTRING_INDEX(v_full_table_name, ' ', 1));
    END IF;
    SET v_full_table_name = TRIM(BOTH ', ' FROM v_full_table_name);

    -- Extract schema and table name
    IF LOCATE('.', v_full_table_name) > 0 THEN
        SET v_schema_name = SUBSTRING_INDEX(v_full_table_name, '.', 1);
        SET v_table_name = SUBSTRING_INDEX(v_full_table_name, '.', -1);
    ELSE
        SET v_schema_name = 'api_wf';
        SET v_table_name = v_full_table_name;
    END IF;

    -- Parse SELECT clause to extract column aliases
    -- Handle patterns like: column_name, function(column) alias, column AS alias
    SET @remaining = v_select_clause;
    SET @pos = 1;
    
    WHILE LENGTH(@remaining) > 0 AND @pos < 100 DO
        -- Get next column expression (up to comma or end)
        SET v_column_expr = TRIM(SUBSTRING_INDEX(@remaining, ',', 1));
        SET @remaining = TRIM(SUBSTRING(@remaining, LENGTH(v_column_expr) + 2));
        
        -- Check if it has an alias (contains space or AS keyword)
        IF LOCATE(' as ', LOWER(v_column_expr)) > 0 THEN
            -- Pattern: column AS alias
            SET v_actual_column = TRIM(SUBSTRING_INDEX(v_column_expr, ' ', 1));
            SET v_column_alias = TRIM(SUBSTRING_INDEX(v_column_expr, ' ', -1));
        ELSEIF LOCATE(' ', v_column_expr) > 0 AND LOCATE('(', v_column_expr) > 0 THEN
            -- Pattern: function(column) alias
            SET v_actual_column = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v_column_expr, '(', -1), ')', 1));
            SET v_column_alias = TRIM(SUBSTRING_INDEX(v_column_expr, ' ', -1));
            -- Mark as function-based
            INSERT INTO temp_parsed_columns (column_alias, actual_column, is_function)
            VALUES (v_column_alias, v_actual_column, TRUE);
            SET @pos = @pos + 1;
            ITERATE;
        ELSE
            -- Simple column name
            SET v_column_alias = TRIM(v_column_expr);
            SET v_actual_column = v_column_alias;
        END IF;
        
        INSERT INTO temp_parsed_columns (column_alias, actual_column, is_function)
        VALUES (v_column_alias, v_actual_column, FALSE);
        
        SET @pos = @pos + 1;
    END WHILE;

    -- RESULT SET 1: Metadata
    SELECT
        p_xref_id as xref_id,
        v_table_name as table_name,
        v_schema_name as schema_name,
        v_component_type as component_type,
        v_select_clause as selected_columns;

    -- RESULT SET 2: Field configurations
    -- Join parsed columns with information_schema to get data types
    SELECT
        COALESCE(pc.column_alias, c.column_name) as name,
        COALESCE(c.data_type, 'varchar') as dataType,
        COALESCE(c.is_nullable, 'YES') as nullable,
        c.column_default as defaultValue,
        CASE
            WHEN COALESCE(c.data_type, 'varchar') IN ('text', 'longtext') THEN 'textarea'
            WHEN COALESCE(c.data_type, 'varchar') IN ('datetime', 'timestamp') THEN 'datetime-local'
            WHEN COALESCE(c.data_type, 'varchar') = 'date' THEN 'date'
            WHEN COALESCE(c.data_type, 'varchar') IN ('int', 'bigint', 'decimal', 'float', 'double') THEN 'number'
            WHEN COALESCE(c.data_type, 'varchar') = 'tinyint' THEN 'checkbox'
            ELSE 'text'
        END as inputType,
        CASE
            WHEN pc.column_alias LIKE '%\\_id' AND pc.column_alias != CONCAT(v_table_name, '_id') THEN TRUE
            WHEN pc.column_alias IN ('created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by') THEN TRUE
            WHEN pc.is_function = TRUE THEN FALSE  -- Function-based columns visible by default
            ELSE FALSE
        END as defaultHidden
    FROM temp_parsed_columns pc
    LEFT JOIN information_schema.columns c
        ON c.table_schema = v_schema_name
        AND c.table_name = v_table_name
        AND c.column_name = pc.actual_column
    ORDER BY pc.column_alias;

    -- Cleanup
    DROP TEMPORARY TABLE IF EXISTS temp_parsed_columns;

END$$

DELIMITER ;
