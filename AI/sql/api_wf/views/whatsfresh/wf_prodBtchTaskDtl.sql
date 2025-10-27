 CREATE OR REPLACE VIEW api_wf.wf_prodBtchTaskDtl AS
  SELECT
    b.ordr,
    b.name AS taskName,
    IFNULL(pb.prodBtchNbr, '') AS prodBtchNbr,
    IFNULL(a.workers, '') AS workers,
    whatsfresh.f_json_to_com_delim(a.workers) AS taskWrkrs,
    IFNULL(a.measure_value, '') AS measureValue,
    IFNULL(a.comments, '') AS comments,
    b.active AS taskActv,
    -- IDs with full names
    IFNULL(a.id, 0) AS product_batch_task_id,
    IFNULL(a.product_batch_id, 0) AS product_batch_id,
    IFNULL(pb.product_id, 0) AS product_id,
    b.id AS task_id,
    b.account_id AS account_id
  FROM whatsfresh.tasks b
  LEFT JOIN whatsfresh.product_batch_tasks a
    ON b.id = a.task_id
  LEFT JOIN api_wf.wf_prodBtchDtl pb
    ON a.product_batch_id = pb.product_batch_id  -- Use the base view!
  ORDER BY pb.prodBtchNbr, b.product_type_id, b.ordr;