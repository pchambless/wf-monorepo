 CREATE PROCEDURE api_wf.sp_hier_structure(
      IN pageID INT
  )
  BEGIN
      WITH RECURSIVE component_tree AS (
          -- Base: Root Container (parent_id = id)
          SELECT
              x.id AS xref_id,
              x.pageID,
              reg.pageName,
              reg.appName,
              x.parent_id,
              x.comp_name,
              reg.pageName AS parent_name,
              CONCAT(reg.pageName, '.', x.comp_name) AS parentCompName,
              x.title,
              x.comp_type,
              x.description,
              x.posOrder,
              x.style AS override_styles,
              0 AS level,
              CAST(x.id AS CHAR(500)) AS id_path
          FROM api_wf.eventComp_xref x
          JOIN api_wf.page_registry reg ON x.pageID = reg.id
          WHERE x.pageID = pageID
            AND x.parent_id = x.id  -- Self-reference = root
            AND x.active = 1

          UNION ALL

          -- Recursive: All descendants
          SELECT
              child.id,
              child.pageID,
              reg.pageName,
              reg.appName,
              child.parent_id,
              child.comp_name,
              parent_tree.comp_name AS parent_name,
              CONCAT(parent_tree.comp_name, '.', child.comp_name) AS parentCompName,
              child.title,
              child.comp_type,
              child.description,
              child.posOrder,
              child.style,
              parent_tree.level + 1 AS level,
              CONCAT(parent_tree.id_path, ',', child.id) AS id_path
          FROM api_wf.eventComp_xref child
          JOIN component_tree parent_tree ON child.parent_id = parent_tree.xref_id
          JOIN api_wf.page_registry reg ON child.pageID = reg.id
          WHERE child.active = 1
            AND child.parent_id != child.id  -- Not a root
            AND parent_tree.level < 20  -- Prevent runaway (was 10, now 20 for complex pages)
      )
      SELECT
          ct.xref_id AS id,
          ct.parent_id,
          ct.pageID,
          ct.pageName,
          ct.appName,
          ct.comp_name,
          ct.parent_name,
          ct.parentCompName,
          ct.title,
          ct.comp_type,
          ct.description,
          ct.posOrder,
          ct.override_styles,
          -- Force Modals to level 0 for consistent top-level rendering
          CASE 
            WHEN ct.comp_type = 'Modal' THEN 0
            ELSE ct.level
          END AS level,
          ct.id_path
      FROM component_tree ct
      ORDER BY 
        CASE WHEN ct.comp_type = 'Modal' THEN 0 ELSE ct.level END, 
        ct.posOrder;
  END;