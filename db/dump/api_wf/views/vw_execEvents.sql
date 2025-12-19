CREATE OR REPLACE VIEW vw_execEvents AS
  SELECT
    qry_keys.key_name AS qryName,
    JSON_UNQUOTE(JSON_EXTRACT(c.eventSQL, CONCAT('$.', qry_keys.key_name))) AS qrySQL,
    'composite' AS source,
    c.id AS source_id,
    c.name AS component_name
  FROM composites c
  JOIN JSON_TABLE(
    JSON_KEYS(c.eventSQL),
    '$[*]' COLUMNS (key_name VARCHAR(100) PATH '$')
  ) AS qry_keys
  WHERE c.active = 1
    AND c.eventSQL IS NOT NULL

  UNION ALL

  SELECT
    qry_keys.key_name AS qryName,
    JSON_UNQUOTE(JSON_EXTRACT(pc.eventSQL, CONCAT('$.', qry_keys.key_name))) AS qrySQL,
    'pageConfig' AS source,
    pc.id AS source_id,
    pcomp.comp_name AS component_name
  FROM pageConfig pc
  JOIN pageComponents pcomp ON pc.pageComponent_id = pcomp.id
  JOIN JSON_TABLE(
    JSON_KEYS(pc.eventSQL),
    '$[*]' COLUMNS (key_name VARCHAR(100) PATH '$')
  ) AS qry_keys
  WHERE pc.active = 1
    AND pc.eventSQL IS NOT NULL;



