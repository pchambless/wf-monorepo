DROP PROCEDURE IF EXISTS `api_wf`.`sp_hier_structure`;

DELIMITER $$

CREATE DEFINER=`wf_admin`@`%` PROCEDURE `api_wf`.`sp_hier_structure`(
    IN `xrefID`  INT
)
BEGIN
      WITH RECURSIVE wf_hier AS (
          -- Start with the parent app as root
          SELECT
              a.id,
              a.comp_name,
              a.title,
              a.posOrder,
              a.comp_type,
              a.container,
              -1 as level,
              CAST(a.id AS CHAR(100)) id_path,
              a.parent_id
          FROM api_wf.vw_hier_components a
          WHERE a.id = (SELECT parent_id FROM api_wf.vw_hier_components WHERE id = xrefID)

          UNION ALL

          -- Add the specified page at level 0
          SELECT
              p.id,
              p.comp_name,
              p.title,
              p.posOrder,
              p.comp_type,
              p.container,
              0 as level,
              CONCAT((SELECT CAST(parent_id AS CHAR) FROM api_wf.vw_hier_components WHERE id = xrefID), ',', p.id) id_path,
              p.parent_id
          FROM api_wf.vw_hier_components p
          WHERE p.id = xrefID

          UNION ALL

          -- Recurse from the page down
          SELECT
              v.id,
              v.comp_name,
              v.title,
              v.posOrder,
              v.comp_type,
              v.container,
              p.level + 1,
              CONCAT(p.id_path, ',', v.id) id_path,
              v.parent_id
          FROM api_wf.vw_hier_components v
          JOIN wf_hier p ON v.parent_id = p.id
          WHERE p.level >= 0 AND p.level < 10
      )
      SELECT
          h.id as xref_id,
          h.comp_name,
          h.title,
          h.comp_type,
          h.container,
          h.parent_id,
          h.posOrder,
          h.level,
          h.id_path
      FROM wf_hier h
      ORDER BY id_path, posOrder, h.id;
END$$

DELIMITER ;