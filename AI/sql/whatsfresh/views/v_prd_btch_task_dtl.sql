CREATE OR REPLACE VIEW whatsfresh.v_prd_btch_task_dtl AS
SELECT
  ROW_NUMBER() OVER() uID, 
  b.ordr,
  b.name AS task_name,
  IFNULL(d.batch_number, '') AS prd_btch_nbr,
  IFNULL(a.workers, '') AS workers,
  whatsfresh.f_json_to_com_delim(a.workers) AS taskWrkrs,
  IFNULL(a.measure_value, '') AS measure_value,
  IFNULL(a.comments, '') AS comments,
  b.`active` AS task_active,
  IFNULL(a.id, 0) AS prd_task_id,
  IFNULL(a.product_batch_id, 0) AS prd_btch_id,
  IFNULL(d.product_id, 0) AS prd_id,
  b.id AS task_id,
  b.account_id AS acct_id
FROM
  whatsfresh.tasks b
LEFT JOIN
  whatsfresh.product_batch_tasks a ON b.id = a.task_id
LEFT JOIN
  whatsfresh.product_batches d ON a.product_batch_id = d.id
ORDER BY
  d.batch_number, b.product_type_id, b.ordr;
