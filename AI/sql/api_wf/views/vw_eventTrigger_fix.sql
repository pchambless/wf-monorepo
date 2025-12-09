-- Fix vw_eventTrigger to handle both CRUD pages (using template) and custom pages (using own components)
-- This view now uses a dual join approach:
-- 1. First tries to join to template components (pageID=11) for CRUD pages
-- 2. Falls back to the page's own components for custom pages

-- Drop the view first to avoid any issues
DROP VIEW IF EXISTS api_wf.vw_eventTrigger;

-- Recreate with dual join pattern
CREATE VIEW api_wf.vw_eventTrigger AS
SELECT 
  a.id AS trigger_id,
  a.pageID,
  a.xref_id,
  COALESCE(b_template.pageName, b_own.pageName) AS pageName,
  COALESCE(b_template.comp_name, b_own.comp_name) AS comp_name,
  COALESCE(b_template.comp_type, b_own.comp_type) AS comp_type,
  a.ordr,
  a.class,
  a.action,
  COALESCE(b_template.parent_id, b_own.parent_id) AS parent_id,
  e.api_id,
  e.wrkFlow_id,
  e.controller_id,
  d.is_dom_event,
  a.content
FROM api_wf.eventTrigger a
LEFT JOIN api_wf.vw_hier_components b_template 
  ON a.xref_id = b_template.xref_id AND b_template.pageID = 11
LEFT JOIN api_wf.vw_hier_components b_own 
  ON a.xref_id = b_own.xref_id AND a.pageID = b_own.pageID
JOIN api_wf.triggers d 
  ON a.class = d.name
JOIN api_wf.triggers e 
  ON a.action = e.name
ORDER BY a.pageID, COALESCE(b_template.parent_id, b_own.parent_id), a.xref_id, a.ordr;
