CREATE
OR REPLACE VIEW brndList AS
SELECT
a.id AS brndID,
a.name AS brndName,
a.comments AS brndComments,
a.url AS brndURL,
a.account_id AS acctID
FROM whatsfresh.brands a
WHERE (a.active = 1)
ORDER BY a.account_id,
a.name;
