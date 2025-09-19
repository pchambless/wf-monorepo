CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_hier_page`(
	IN `pageID` INT
)
BEGIN
    WITH RECURSIVE page_hier AS (
        -- Start with the specified page
        SELECT
            id,
            parent_id,
            comp_name,
            template,
            position,
            props,
            parent_title,
            template_title,
            tmplt_def,
            app_id,
            eventType_id,
            posOrder, 
            0 as level,
            CAST(id AS CHAR(100)) id_path
        FROM api_wf.vw_hier_components
        WHERE id = pageID

        UNION ALL

        -- Get all descendants recursively
        SELECT
            v.id,
            v.parent_id,
            v.comp_name,
            v.template,
            v.position,
            v.props,
            v.parent_title,
            v.template_title,
            v.tmplt_def,
            v.app_id,
            v.eventType_id,
            v.posOrder, 
            p.level + 1,
           CONCAT(p.id_path, ',', v.id) id_path
        FROM api_wf.vw_hier_components v
        JOIN page_hier p ON v.parent_id = p.id
        WHERE p.level < 10  -- Prevent infinite recursion
    )
    SELECT
        id,
        parent_id,
        comp_name,
        template,
        position,
        props,
        posOrder, 
        level,
        id_path
    FROM page_hier
     ORDER BY level, parent_id, posOrder, id;
END