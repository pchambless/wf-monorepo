CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_genFormFields`(
    IN p_pageID INT,
    IN p_qryName VARCHAR(100)
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    DECLARE v_schema_name VARCHAR(100);
    DECLARE v_component_name VARCHAR(100);
    DECLARE v_qry_sql TEXT;
    DECLARE v_full_table_name VARCHAR(200);
    DECLARE v_select_clause TEXT;

    -- Get component details from vw_execEvents
    SELECT a.component_name, a.qrySQL
    INTO v_component_name, v_qry_sql
    FROM vw_execEvents a
    WHERE a.pageID = p_pageID 
      AND a.qryName = p_qryName
    LIMIT 1;

    -- Handle case where no query found
    IF v_qry_sql IS NULL THEN
        SELECT 
            p_pageID as pageID,
            p_qryName as qryName,
            'ERROR: Query not found' as error_message;
        LEAVE sp_genFormFields;
    END IF;

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

    -- RESULT SET 1: Metadata
    SELECT
        p_pageID as pageID,
        p_qryName as qryName,
        v_table_name as table_name,
        v_schema_name as schema_name,
        v_component_name as component_name,
        v_select_clause as selected_columns;

    -- RESULT SET 2: Form Field configurations (only columns in SELECT)
    SELECT
        column_name as name,
        data_type as dataType,
        is_nullable as nullable,
        column_default as defaultValue,
        character_maximum_length as maxLength,
        CASE
            WHEN data_type IN ('text', 'longtext') THEN 'textarea'
            WHEN data_type IN ('datetime', 'timestamp') THEN 'datetime-local'
            WHEN data_type = 'date' THEN 'date'
            WHEN data_type = 'time' THEN 'time'
            WHEN data_type IN ('int', 'bigint', 'decimal', 'float', 'double') THEN 'number'
            WHEN data_type = 'tinyint' AND column_name LIKE '%active%' THEN 'checkbox'
            WHEN data_type = 'tinyint' THEN 'checkbox'
            WHEN data_type = 'enum' THEN 'select'
            WHEN character_maximum_length > 255 THEN 'textarea'
            ELSE 'text'
        END as inputType,
        CASE
            WHEN is_nullable = 'NO' AND column_default IS NULL THEN 'true'
            ELSE 'false'
        END as required,
        CASE
            WHEN column_name LIKE '%email%' THEN 'email'
            WHEN column_name LIKE '%password%' THEN 'password'
            WHEN column_name LIKE '%phone%' THEN 'tel'
            WHEN column_name LIKE '%url%' OR column_name LIKE '%link%' THEN 'url'
            ELSE NULL
        END as htmlInputType,
        CASE
            WHEN column_comment != '' THEN column_comment
            ELSE REPLACE(REPLACE(column_name, '_', ' '), 'ID', 'ID')
        END as label
    FROM information_schema.columns
    WHERE table_schema = v_schema_name
      AND table_name = v_table_name
      AND FIND_IN_SET(column_name, REPLACE(v_select_clause, ' ', '')) > 0
    ORDER BY FIND_IN_SET(column_name, REPLACE(v_select_clause, ' ', ''));

END