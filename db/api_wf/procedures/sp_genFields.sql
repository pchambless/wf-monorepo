DROP PROCEDURE IF EXISTS api_wf.sp_genFields;

DELIMITER $$

CREATE PROCEDURE api_wf.sp_genFields(
    IN p_qry_sql TEXT
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    DECLARE v_schema_name VARCHAR(100);
    DECLARE v_select_clause TEXT;
    DECLARE v_full_table_name VARCHAR(200);

    -- Extract column list from SELECT clause
    SET v_select_clause = SUBSTRING_INDEX(SUBSTRING_INDEX(p_qry_sql, 'FROM', 1), 'SELECT', -1);
    SET v_select_clause = REPLACE(REPLACE(REPLACE(v_select_clause, '\r\n', ' '), '\n', ' '), '\t', ' ');
    SET v_select_clause = TRIM(v_select_clause);

    -- Extract table from FROM clause
    SET v_full_table_name = SUBSTRING_INDEX(SUBSTRING_INDEX(p_qry_sql, 'WHERE', 1), 'FROM', -1);
    SET v_full_table_name = REPLACE(REPLACE(REPLACE(v_full_table_name, '\r\n', ' '), '\n', ' '), '\t', ' ');
    SET v_full_table_name = TRIM(v_full_table_name);

    -- Parse schema.table
    IF LOCATE('.', v_full_table_name) > 0 THEN
        SET v_schema_name = SUBSTRING_INDEX(v_full_table_name, '.', 1);
        SET v_table_name = SUBSTRING_INDEX(v_full_table_name, '.', -1);
    ELSE
        SET v_schema_name = 'whatsfresh';
        SET v_table_name = v_full_table_name;
    END IF;

    -- Return column metadata in SELECT order
    SELECT
        column_name as name,
        data_type as dataType,
        column_type as columnType,
        is_nullable as nullable,
        column_default as defaultValue,
        character_maximum_length as maxLength,
        column_key as columnKey,
        extra as extra
    FROM information_schema.columns
    WHERE table_schema = v_schema_name
      AND table_name = v_table_name
      AND FIND_IN_SET(column_name, REPLACE(v_select_clause, ' ', '')) > 0
    ORDER BY FIND_IN_SET(column_name, REPLACE(v_select_clause, ' ', ''));

END$$

DELIMITER ;
