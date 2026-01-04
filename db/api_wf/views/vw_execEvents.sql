CREATE
OR REPLACE VIEW vw_execEvents AS
SELECT
0 AS pageID,
qry_keys.key_name AS qryName,
json_unquote(json_extract(c.eventSQL,
concat('$.',
qry_keys.key_name))) AS qrySQL,
'composite' AS source,
c.id AS source_id,
c.name AS component_name,
c.props AS props,
c.triggers AS triggers,
c.id AS composite_id,
c.name AS composite_name,
c.category AS composite_category,
c.components AS composite_components
FROM (composites c
JOIN json_table(json_keys(c.eventSQL),
'$[*]' columns (key_name varchar(100) character set utf8mb4 collate utf8mb4_unicode_ci path '$')) qry_keys)
WHERE ((c.active = 1)
AND (c.eventSQL is not null))

UNION

ALL

select pc.pageID AS pageID,
qry_keys.key_name AS qryName,
json_unquote(json_extract(pc.eventSQL,
concat('$.',
qry_keys.key_name))) AS qrySQL,
'pageConfig' AS source,
pc.id AS source_id,
pcomp.comp_name AS component_name,
pc.props AS props,
pc.triggers AS triggers,
pc.composite_id AS composite_id,
comp.name AS composite_name,
comp.category AS composite_category,
comp.components AS composite_components from (((pageConfig pc
JOIN pageComponents pcomp on((pc.pageComponent_id = pcomp.id)))
JOIN composites comp on((pc.composite_id = comp.id)))
JOIN json_table(json_keys(pc.eventSQL),
'$[*]' columns (key_name varchar(100) character set utf8mb4 collate utf8mb4_unicode_ci path '$')) qry_keys) where ((pc.active = 1)
AND (pc.eventSQL is not null));
