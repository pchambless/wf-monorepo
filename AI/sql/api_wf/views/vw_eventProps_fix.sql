-- Fix vw_eventProps to handle both CRUD pages (using template) and custom pages (using own components)
-- This view now uses a dual join approach:
-- 1. First tries to join to template components (pageID=11) for CRUD pages
-- 2. Falls back to the page's own components for custom pages like login

-- Drop the view first to avoid any issues
DROP VIEW IF EXISTS api_wf.vw_eventProps;

-- Recreate with dual join pattern
CREATE VIEW api_wf.vw_eventProps AS
SELECT 
  a.id AS prop_id,
  a.pageID,
  pr.pageName,
  a.xref_id,
  COALESCE(b_template.comp_type, b_own.comp_type) AS comp_type,
  COALESCE(b_template.comp_name, b_own.comp_name) AS comp_name,
  a.paramName,
  a.paramVal,
  COALESCE(b_template.parent_id, b_own.parent_id) AS parent_id
FROM api_wf.eventProps a
LEFT JOIN api_wf.vw_hier_components b_template 
  ON a.xref_id = b_template.xref_id AND b_template.pageID = 11
LEFT JOIN api_wf.vw_hier_components b_own 
  ON a.xref_id = b_own.xref_id AND a.pageID = b_own.pageID
LEFT JOIN api_wf.page_registry pr 
  ON a.pageID = pr.id
ORDER BY a.pageID, a.xref_id, a.paramName;
