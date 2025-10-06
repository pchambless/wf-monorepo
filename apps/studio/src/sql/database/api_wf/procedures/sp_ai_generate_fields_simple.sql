DROP PROCEDURE IF EXISTS `api_wf`.`sp_ai_generate_fields_simple`;

DELIMITER $$

CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_ai_generate_fields_simple`(
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

    -- Simple query without CASE or JSON
    SELECT
        column_name as field_name,
        data_type,
        is_nullable,
        column_default,
        v_table_name as table_name,
        v_schema_name as schema_name,
        v_component_type as component_type
    FROM information_schema.columns
    WHERE table_name = v_table_name
    AND table_schema = v_schema_name
    ORDER BY ordinal_position;

END$$

DELIMITER ;
