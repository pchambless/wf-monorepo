DROP PROCEDURE IF EXISTS `api_wf`.`sp_ai_generate_fields`;

DELIMITER $$

CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_ai_generate_fields`(
    IN p_xref_id INT
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    DECLARE v_schema_name VARCHAR(100);
    DECLARE v_component_type VARCHAR(20);
    DECLARE v_qry_sql TEXT;
    DECLARE v_full_table_name VARCHAR(200);

    -- Get component details from vw_eventSQL
    SELECT
        a.comp_type,
        a.qrySQL
    INTO
        v_component_type,
        v_qry_sql
    FROM vw_eventSQL a
    WHERE a.xref_id = p_xref_id;

    -- Extract table name from SQL
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

    -- Generate field configurations with CASE and JSON
    SELECT
        column_name as field_name,
        data_type,
        is_nullable,
        column_default,
        CASE
            WHEN column_name LIKE '%\\_id' AND column_name != CONCAT(v_table_name, '_id') THEN 'hidden'
            WHEN column_name IN ('created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by') THEN 'hidden'
            WHEN data_type IN ('text', 'longtext') THEN 'textarea'
            WHEN data_type IN ('datetime', 'timestamp') THEN 'datetime-local'
            WHEN data_type = 'date' THEN 'date'
            WHEN data_type IN ('int', 'bigint', 'decimal', 'float', 'double') THEN 'number'
            WHEN data_type = 'tinyint' THEN 'checkbox'
            ELSE 'text'
        END as suggested_input_type,
        CASE
            WHEN v_component_type = 'Grid' THEN JSON_OBJECT(
                'sortable', true,
                'filterable', true,
                'width', CASE
                    WHEN data_type IN ('text', 'longtext') THEN 200
                    WHEN data_type IN ('datetime', 'timestamp') THEN 150
                    ELSE 100
                END
            )
            WHEN v_component_type = 'Form' THEN JSON_OBJECT(
                'required', is_nullable = 'NO',
                'placeholder', CONCAT('Enter ', REPLACE(column_name, '_', ' '))
            )
            WHEN v_component_type = 'Select' THEN JSON_OBJECT(
                'value', column_name,
                'label', column_name
            )
            ELSE JSON_OBJECT()
        END as component_props,
        v_table_name as table_name,
        v_component_type as component_type
    FROM information_schema.columns
    WHERE table_name = v_table_name
    AND table_schema = v_schema_name
    ORDER BY ordinal_position;

END$$

DELIMITER ;
