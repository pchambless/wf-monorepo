create or replace view prodBtchList as
select
  pb.id as prodBtchID,
  pb.batch_number as btchNbr,
  date_format(pb.batch_start, '%Y-%m-%d') as btchStart,
  pb.location as btchLoc,
  pb.batch_quantity as btchQty,
  pb.global_measure_unit_id as measID,
  date_format(pb.best_by_date, '%Y-%m-%d') as bestByDate,
  pb.comments as comments,
  pb.product_id as prodID,
  p.name as prodName,
  pt.name as prodType,
  p.account_id as acctID
from
  (
    (
      whatsfresh.product_batches pb
      join whatsfresh.products p on ((pb.product_id = p.id))
    )
    join whatsfresh.product_types pt on ((p.product_type_id = pt.id))
  )
where
  (
    (pb.active = 1)
    and (p.active = 1)
    and (pt.active = 1)
  )
order by
  pb.batch_start desc,
  pb.batch_number
