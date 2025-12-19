create or replace view wf_prodBtchDtl as
select
  prd.name as prodName,
  prd.code as prodCode,
  c.name as prodTypeName,
  prd.recipe_quantity as rcpeQty,
  whatsfresh.f_measure (prd.measure_id) as rcpeMeas,
  pb.recipe_multiply_factor as rcpeMultFctr,
  ifnull(d.ingr_maps, 0) as ingrMaps,
  ifnull(e.task_maps, 0) as taskMaps,
  ifnull((d.ingr_maps + e.task_maps), 0) as totalMaps,
  ifnull(pb.location, '') as location,
  ifnull(pb.batch_quantity, 0) as btchQty,
  ifnull(whatsfresh.f_measure (pb.measure_id), '') as btchMeas,
  ifnull(
    concat(
      pb.batch_quantity,
      ' ',
      whatsfresh.f_measure (pb.measure_id),
      's'
    ),
    ''
  ) as qtyMeas,
  ifnull(
    cast(date_format(pb.batch_start, '%Y-%m-%d') as date),
    ''
  ) as prodBtchDate,
  ifnull(pb.comments, '') as comments,
  ifnull(pb.batch_number, 'No Batches') as prodBtchNbr,
  ifnull(date_format(pb.best_by_date, '%Y-%m-%d'), '') as bestByDate,
  prd.active as prodActv,
  pb.active as prodBtchActv,
  c.active as prdTypeActv,
  pb.created_at as prodBtchCreatedAt,
  prd.product_type_id as product_type_id,
  prd.id as product_id,
  pb.id as product_batch_id,
  prd.account_id as account_id,
  pb.measure_id as measure_id
from
  (
    (
      (
        (
          whatsfresh.products prd
          left join whatsfresh.product_batches pb on ((prd.id = pb.product_id))
        )
        join whatsfresh.product_types c on ((prd.product_type_id = c.id))
      )
      left join (
        select
          whatsfresh.product_batch_ingredients.product_batch_id as product_batch_id,
          count(0) as ingr_maps
        from
          whatsfresh.product_batch_ingredients
        group by
          whatsfresh.product_batch_ingredients.product_batch_id
      ) d on ((pb.id = d.product_batch_id))
    )
    left join (
      select
        whatsfresh.product_batch_tasks.product_batch_id as product_batch_id,
        count(0) as task_maps
      from
        whatsfresh.product_batch_tasks
      group by
        whatsfresh.product_batch_tasks.product_batch_id
    ) e on ((pb.id = e.product_batch_id))
  )
order by
  prd.account_id,
  pb.batch_start desc,
  pb.batch_number
