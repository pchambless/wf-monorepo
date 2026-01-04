CREATE
OR REPLACE VIEW vw_Composites AS
SELECT
composites.id AS id,
composites.name AS name,
composites.category AS category,
composites.components AS components,
composites.props AS props,
composites.eventSQL AS eventSQL,
composites.triggers AS triggers
FROM composites
WHERE (composites.active = 1)
ORDER BY composites.category,
composites.name;
