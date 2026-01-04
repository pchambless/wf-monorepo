CREATE
OR REPLACE VIEW wrkrList AS
SELECT
a.id AS wrkrID,
a.name AS wrkrName,
a.account_id AS acctID
FROM whatsfresh.workers a
WHERE (a.active = 1);
