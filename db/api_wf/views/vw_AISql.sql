CREATE
OR REPLACE VIEW api_wf.vw_AISql AS
SELECT
a.id AS id,
a.category AS category,
a.qryName AS qryName,
a.qrySQL AS qrySQL,
a.description AS description,
api_wf.f_aiParams(a.id) AS params,
a.usage_count AS usage_count,
a.created_at AS created_at,
a.created_by AS created_by,
a.updated_at AS updated_at,
a.updated_by AS updated_by,
a.deleted_at AS deleted_at,
a.deleted_by AS deleted_by,
a.active AS active
FROM api_wf.AISql a 
WHERE (a.active = 1);
