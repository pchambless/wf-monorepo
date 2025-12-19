create or replace view wf_prodBtchTaskDtl as
select
  b.ordr as ordr,
  b.name as taskName,
  ifnull(pb.prodBtchNbr, '') as prodBtchNbr,
  ifnull(a.workers, '') as workers,
  whatsfresh.f_json_to_com_delim (a.workers) as taskWrkrs,
  ifnull(a.measure_value, '') as measureValue,
  ifnull(a.comments, '') as comments,
  b.active as taskActv,
  ifnull(a.id, 0) as product_batch_task_id,
  ifnull(a.product_batch_id, 0) as product_batch_id,
  ifnull(pb.product_id, 0) as product_id,
  b.id as task_id,
  b.account_id as account_id
from
  (
    (
      whatsfresh.tasks b
      left join whatsfresh.product_batch_tasks a on ((b.id = a.task_id))
    )
    left join wf_prodBtchDtl pb on ((a.product_batch_id = pb.product_batch_id))
  )
order by
  pb.prodBtchNbr,
  b.product_type_id,
  b.ordr
