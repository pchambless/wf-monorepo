CREATE
OR REPLACE VIEW wf_shopEvent AS
SELECT
whatsfresh.f_shop_event(a.id) AS shopName,
concat('$',
format(ifnull(b.total_amount,
0),
2)) AS totalAmt,
ifnull(b.items,
0) AS items,
ifnull(a.comments,
'') AS comments,
whatsfresh.f_vendor(a.vendor_id) AS vndrName,
date_format(a.shop_date,
'%Y-%m-%d') AS shopDate,
a.account_id AS account_id,
a.vendor_id AS vendor_id,
a.id AS shop_event_id
FROM (whatsfresh.shop_event a
LEFT JOIN (select whatsfresh.ingredient_batches.shop_event_id AS shop_event_id,
count(whatsfresh.ingredient_batches.id) AS items,
ifnull(sum((whatsfresh.ingredient_batches.purchase_quantity * whatsfresh.ingredient_batches.unit_price)),
0) AS total_amount from whatsfresh.ingredient_batches
GROUP BY whatsfresh.ingredient_batches.shop_event_id) b on((a.id = b.shop_event_id)))
ORDER BY a.shop_date desc;
