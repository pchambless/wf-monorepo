CREATE
OR REPLACE VIEW ingrList AS
SELECT
a.id AS ingrID,
a.name AS ingrName,
a.code AS ingrCode,
a.description AS ingrDesc,
a.default_measure_unit AS measID,
a.default_vendor AS vndrID,
a.grams_per_ounce AS ingrGrmsPerOz,
a.ingredient_type_id AS ingrTypeID,
a.account_id AS acctID
FROM whatsfresh.ingredients a
ORDER BY a.ingredient_type_id,
a.name;
