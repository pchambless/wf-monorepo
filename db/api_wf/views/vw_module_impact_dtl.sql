CREATE
OR REPLACE VIEW vw_module_impact_dtl AS
SELECT
t.plan_id AS plan,
t.change_type AS change_type,
m.package AS package,
m.fileFolder AS fileFolder,
m.fileName AS fileName,
m.file_path AS file_path,
m.active AS active,
m.last_detected_at AS last_detected_at,
t.description AS impact,
t.created_at AS impact_date,
t.created_by AS impact_by,
p.name AS plan_name,
p.status AS plan_status,
t.affected_apps AS affected_apps,
t.id AS impact_id,
(case when (t.id is null) then 'No impacts logged' else 'Has impacts' end) AS impact_status
FROM ((modules m
LEFT JOIN plan_impacts t on((trim(trailing '/' from m.file_path) = trim(trailing '/' from t.file_path))))
LEFT JOIN plans p on((t.plan_id = p.id)))
ORDER BY t.plan_id desc,
m.package,
m.fileFolder,
m.fileName;
