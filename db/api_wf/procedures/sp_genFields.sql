CREATE DEFINER=`wf_admin`@`%` PROCEDURE `sp_genFields`(
    IN p_xref_id INT
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    DECLARE v_schema_name VARCHAR(100);
    DECLARE v_component_type VARCHAR(20);
    DECLARE v_qry_sql TEXT;
    DECLARE v_full_table_name VARCHAR(200);
    DECLARE v_select_clause TEXT;

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
    END
