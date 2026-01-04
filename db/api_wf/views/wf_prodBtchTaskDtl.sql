CREATE
OR REPLACE VIEW wf_prodBtchTaskDtl AS
SELECT
b.ordr AS ordr,
b.name AS taskName,
ifnull(pb.prodBtchNbr,
'') AS prodBtchNbr,
ifnull(a.workers,
'') AS workers,
whatsfresh.f_json_to_com_delim(a.workers) AS taskWrkrs,
ifnull(a.measure_value,
'') AS measureValue,
ifnull(a.comments,
'') AS comments,
b.active AS taskActv,
ifnull(a.id,
0) AS product_batch_task_id,
ifnull(a.product_batch_id,
0) AS product_batch_id,
ifnull(pb.product_id,
0) AS product_id,
b.id AS task_id,
b.account_id AS account_id
FROM ((whatsfresh.tasks b
LEFT JOIN whatsfresh.product_batch_tasks a on((b.id = a.task_id)))
LEFT JOIN wf_prodBtchDtl pb on((a.product_batch_id = pb.product_batch_id)))
ORDER BY pb.prodBtchNbr,
b.product_type_id,
b.ordr;
