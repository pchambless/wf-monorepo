CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_hier_structure`(
    IN `xrefID`  INT
)
BEGIN
        WITH RECURSIVE wf_hier AS (
            -- Start with the parent app as root
            SELECT
                a.xref_id,
                a.comp_name,
                a.parent_name,
                a.parentCompName,
                a.title,
                a.posOrder,
                a.comp_type,
                a.container,
                -1 as level,
                CAST(a.comp_name AS AS CHAR(500)) COLLATE utf8mb4_general_ci) id_path
            FROM api_wf.vw_hier_components a
            WHERE a.xref_id = (SELECT parent_name FROM api_wf.vw_hier_components WHERE xref_id = xrefID)

            UNION ALL

            -- Add the specified page at level 0
            SELECT
                p.xref_id,
                p.comp_name,
                p.parent_name,
                p.parentCompName,
                p.title,
                p.posOrder,
                p.comp_type,
                p.container,
                0 as level,
                CONCAT((SELECT CAST(parent_name AS CHAR(500)) COLLATE utf8mb4_general_ci) FROM api_wf.vw_hier_components WHERE xref_id = xrefID), ',', p.comp_name) id_path
            FROM api_wf.vw_hier_components p
            WHERE p.xref_id = xrefID

            UNION ALL

            -- Recurse from the page down
            SELECT
                v.xref_id,
                v.comp_name,
                v.parent_name,
                v.parentCompName,
                v.title,
                v.posOrder,
                v.comp_type,
                v.container,
                p.level + 1,
                CAST(CONCAT(p.id_path, ',', v.comp_name) AS CHAR(500)) COLLATE utf8mb4_general_ci AS id_path
            FROM api_wf.vw_hier_components v
            JOIN wf_hier p ON v.parent_name = p.comp_name 
            WHERE p.level >= 0 AND p.level < 10
        )
        SELECT
            h.xref_id id,
            h.comp_name,
            h.parent_name,
            h.parentCompName,
            h.title,
            h.comp_type,
            h.container,
            h.posOrder,
            h.level,
            h.id_path
        FROM wf_hier h
        ORDER BY id_path, posOrder, xref_id;
  END