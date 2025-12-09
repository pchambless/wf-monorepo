-- Delete page-specific props from CRUD template (pageID=11)
-- These should only exist on individual pages, not the template

-- Show what we're about to delete
SELECT 
  id,
  pageID,
  xref_id,
  paramName,
  LEFT(paramVal, 80) as paramVal_preview
FROM api_wf.eventProps
WHERE pageID = 11 
  AND paramName IN ('columns', 'columnOverrides')
ORDER BY xref_id, paramName;

-- Delete them (uncomment when ready)
-- DELETE FROM api_wf.eventProps
-- WHERE pageID = 11 
--   AND paramName IN ('columns', 'columnOverrides');

-- Verify they're gone
-- SELECT COUNT(*) as remaining_count
-- FROM api_wf.eventProps
-- WHERE pageID = 11 
--   AND paramName IN ('columns', 'columnOverrides');
