CREATE OR REPLACE VIEW vw_context_store AS 
SELECT id, paramName, paramVal, updates, getVals, email, updated_at
FROM context_store
ORDER BY DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') DESC;