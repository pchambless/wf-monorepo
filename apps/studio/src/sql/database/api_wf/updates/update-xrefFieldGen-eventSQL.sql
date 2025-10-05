-- Update xrefFieldGen to call sp_ai_generate_fields stored procedure
-- This replaces the SELECT query with a stored procedure call

UPDATE api_wf.eventSQL
SET
    qrySQL = 'CALL api_wf.sp_ai_generate_fields(:xref_id)',
    description = 'Generate field configurations from database schema for a given component',
    updated_at = NOW(),
    updated_by = 'Claude'
WHERE qryName = 'xrefFieldGen';
