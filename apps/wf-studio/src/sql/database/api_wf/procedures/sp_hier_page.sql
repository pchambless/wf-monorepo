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
            template_cluster,
            position,
            props,
            parent_title,
            template_title,
            tmplt_def,
            app_id,
            eventType_id,
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
            v.template_cluster,
            v.position,
            v.props,
            v.parent_title,
            v.template_title,
            v.tmplt_def,
            v.app_id,
            v.eventType_id,
            p.level + 1,
           CONCAT(p.id, ',', v.id) id_path
        FROM api_wf.vw_hier_components v
        JOIN page_hier p ON v.parent_id = p.id
        WHERE p.level < 10  -- Prevent infinite recursion
    )
    SELECT
        id,
        parent_id,
        comp_name,
        template,
        template_cluster,
        position,
        props,
        level,
        id_path
    FROM page_hier
    order by id_path;
END