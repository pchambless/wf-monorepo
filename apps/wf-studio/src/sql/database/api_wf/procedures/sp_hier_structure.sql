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
              a.posOrder,
              a.comp_name  as level_name,
              a.template,
              a.tmplt_def,
              a.base_styles,
              a.override_styles,
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
              p.posOrder,
              p.comp_name as level_name,
              p.template,
              p.tmplt_def,
              p.base_styles,
              p.override_styles,
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
              v.posOrder,
              CONCAT(REPEAT(':-', p.level + 1), v.comp_name) as level_name,
              v.template,
              v.tmplt_def,
              v.base_styles,
              v.override_styles,
              p.level + 1,
              CONCAT(p.id_path, ',', v.id) id_path,
              v.parent_id
          FROM api_wf.vw_hier_components v
          JOIN wf_hier p ON v.parent_id = p.id
          WHERE p.level >= 0 AND p.level < 10
      )
      SELECT
          h.*,
          -- Add enhanced props from vw_eventProp as JSON object
          -- Returns: {"title": "Login Form", "fields": [...], "columns": [...]}
          (SELECT
              CONCAT('{',
                  GROUP_CONCAT(
                      CONCAT(
                          '"', ep.paramName, '":',
                          CASE
                              -- Detect JSON arrays/objects (starts with [ or {)
                              WHEN LEFT(TRIM(ep.paramVal), 1) IN ('[', '{') THEN ep.paramVal
                              -- Detect boolean values
                              WHEN LOWER(ep.paramVal) IN ('true', 'false') THEN LOWER(ep.paramVal)
                              -- Detect numbers (integer or decimal)
                              WHEN ep.paramVal REGEXP '^-?[0-9]+(\\.[0-9]+)?$' THEN ep.paramVal
                              -- Everything else is a string - strip outer quotes if present, then quote
                              ELSE CONCAT('"',
                                   REPLACE(
                                       REPLACE(TRIM(BOTH '"' FROM ep.paramVal), '\\', '\\\\'),
                                       '"', '\\"'
                                   ),
                                   '"')
                          END
                      )
                      SEPARATOR ','
                  ),
              '}')
          FROM api_wf.vw_eventProp ep
          WHERE ep.xref_id = h.id
            AND ep.paramName != 'workflowTriggers'
          ) as enhancedProps,
          -- Add aggregated triggers from vw_eventTrigger as JSON with is_dom_event flag
          -- Returns: {"onClick": [{"action":"setVals", "ordr":1, "content":"...", "is_dom_event":true}], "onSuccess": [...]}
          (SELECT
              CONCAT('{',
                  GROUP_CONCAT(
                      DISTINCT CONCAT(
                          '"', class, '":',
                          '[',
                          (SELECT GROUP_CONCAT(
                              JSON_OBJECT(
                                  'action', t2.action,
                                  'ordr', t2.ordr,
                                  'content', t2.content,
                                  'is_dom_event', CASE WHEN t2.is_dom_event = 1 THEN true ELSE false END
                              )
                              ORDER BY t2.ordr
                          )
                          FROM api_wf.vw_eventTrigger t2
                          WHERE t2.xref_id = h.id AND t2.class = t1.class
                          ),
                          ']'
                      )
                      SEPARATOR ','
                  ),
              '}')
          FROM api_wf.vw_eventTrigger t1
          WHERE t1.xref_id = h.id
          GROUP BY t1.xref_id
          ) as workflowTriggers,
          -- Add triggers metadata for DirectRenderer to distinguish DOM events vs workflow callbacks
          -- Returns: [{"name":"onClick","is_dom_event":true}, {"name":"onSuccess","is_dom_event":false}, ...]
          (SELECT
              CONCAT('[',
                  GROUP_CONCAT(
                      JSON_OBJECT(
                          'id', tr.id,
                          'name', tr.name,
                          'trigType', tr.trigType,
                          'is_dom_event', CASE WHEN tr.is_dom_event = 1 THEN true ELSE false END,
                          'description', tr.description
                      )
                      ORDER BY tr.trigType, tr.name
                  ),
              ']')
          FROM api_wf.triggers tr
          WHERE tr.active = 1
          ) as triggersMetadata
      FROM wf_hier h
      ORDER BY id_path, posOrder, id;
END$$

DELIMITER ;