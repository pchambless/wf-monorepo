CREATE
OR REPLACE VIEW vw_context_store AS
SELECT
context_store.id AS id,
context_store.paramName AS paramName,
context_store.paramVal AS paramVal,
context_store.updates AS updates,
context_store.getVals AS getVals,
context_store.email AS email,
context_store.updated_at AS updated_at
FROM context_store
ORDER BY date_format(context_store.updated_at,
'%Y-%m-%d %H:%i:%s') desc;
