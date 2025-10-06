DROP PROCEDURE IF EXISTS `api_wf`.`sp_ai_generate_fields_debug`;

DELIMITER $$

CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_ai_generate_fields_debug`(
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

    -- Extract table name from SQL (look for FROM clause) - CASE INSENSITIVE
    SET @from_pos = LOCATE('from ', LOWER(v_qry_sql));
    IF @from_pos > 0 THEN
        -- Extract substring after 'from '
        SET v_full_table_name = SUBSTRING(v_qry_sql, @from_pos + 5);

        -- Replace newlines and tabs with spaces to normalize whitespace
        SET v_full_table_name = REPLACE(REPLACE(REPLACE(v_full_table_name, '\r\n', ' '), '\n', ' '), '\t', ' ');

        -- Get first word (table name)
        SET v_full_table_name = TRIM(SUBSTRING_INDEX(v_full_table_name, ' ', 1));
    END IF;

    -- Final cleanup of any remaining whitespace/punctuation
    SET v_full_table_name = TRIM(BOTH ', ' FROM v_full_table_name);

    -- Extract schema and table name
    IF LOCATE('.', v_full_table_name) > 0 THEN
        SET v_schema_name = SUBSTRING_INDEX(v_full_table_name, '.', 1);
        SET v_table_name = SUBSTRING_INDEX(v_full_table_name, '.', -1);
    ELSE
        SET v_schema_name = 'api_wf';
        SET v_table_name = v_full_table_name;
    END IF;

    -- DEBUG OUTPUT
    SELECT
        p_xref_id as input_xref_id,
        v_component_type as extracted_comp_type,
        v_qry_sql as extracted_sql,
        v_full_table_name as full_table_name,
        v_schema_name as schema_name,
        v_table_name as table_name;

END$$

DELIMITER ;
