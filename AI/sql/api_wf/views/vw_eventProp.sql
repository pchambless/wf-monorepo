CREATE OR REPLACE
ALGORITHM = UNDEFINED VIEW `api_wf`.`vw_eventProps` AS
SELECT 
    a.id AS prop_id,
    a.pageID,
    pr.pageName,
    a.xref_id,
    b.comp_type,
    b.comp_name,
    a.paramName,
    a.paramVal,
    b.parent_id
FROM api_wf.eventProps a
LEFT JOIN api_wf.vw_hier_components b 
  ON a.xref_id = b.xref_id AND b.pageID = 11  -- Join to template
LEFT JOIN api_wf.page_registry pr
  ON a.pageID = pr.id  -- Get actual page name
ORDER BY a.pageID, a.xref_id, a.paramName;