create or replace view ingrBtchList as
select
  ib.id as ingrBtchID,
  ib.batch_number as btchNbr,
  ib.vendor_id as vndrID,
  ib.brand_id as brndID,
  date_format(ib.purchase_date, '%Y-%m-%d') as purchDate,
  ib.unit_quantity as unitQty,
  ib.unit_price as unitPrice,
  ib.purchase_quantity as purchQty,
  ib.measure_id as measID,
  ib.lot_number as lotNbr,
  date_format(ib.best_by_date, '%Y-%m-%d') as bestByDate,
  ib.comments as comments,
  ib.ingredient_id as ingrID,
  (
    case
      when (ib.id is not null) then concat(
        ib.purchase_quantity,
        ' @ $',
        format(coalesce(ib.unit_price, 0), 2),
        ' per ',
        cast(ib.unit_quantity as decimal(10, 2)),
        ' ',
        coalesce(m.abbrev, '')
      )
      else ''
    end
  ) as purch_dtl,
  i.name as ingrName,
  i.code as ingrCode,
  it.name as ingrType,
  v.name as vndrName,
  b.name as brndName,
  cast(
    (
      coalesce(ib.unit_price, 0) / nullif(ib.unit_quantity, 0)
    ) as decimal(13, 4)
  ) as unitRate,
  coalesce((ib.purchase_quantity * ib.unit_price), 0) as purchAmt,
  coalesce(pbi.productBatchCount, 0) as usageCount,
  (
    case
      when (coalesce(pbi.productBatchCount, 0) > 0) then 'In Use'
      when (ib.best_by_date < curdate()) then 'Expired'
      when (ib.best_by_date <= (curdate() + interval 30 day)) then 'Expiring Soon'
      when (ib.purchase_date >= (curdate() - interval 30 day)) then 'Recently Purchased'
      else 'Available'
    end
  ) as batchStatus,
  (
    case
      when (ib.shop_event_id is not null) then concat('Shop Event #', ib.shop_event_id)
      when (
        (ib.purchase_date is not null)
        and (v.name is not null)
      ) then concat(cast(ib.purchase_date as date), ' : ', v.name)
      else null
    end
  ) as shopEventRef,
  i.account_id as acctID
from
  (
    (
      (
        (
          (
            (
              whatsfresh.ingredient_batches ib
              join whatsfresh.ingredients i on ((ib.ingredient_id = i.id))
            )
            join whatsfresh.ingredient_types it on ((i.ingredient_type_id = it.id))
          )
          left join whatsfresh.vendors v on (
            (
              (ib.vendor_id = v.id)
              and (v.active = 'Y')
            )
          )
        )
        left join whatsfresh.brands b on (
          (
            (ib.brand_id = b.id)
            and (b.active = 'Y')
          )
        )
      )
      left join whatsfresh.measures m on ((ib.measure_id = m.id))
    )
    left join (
      select
        pbi.ingredient_batch_id as ingredient_batch_id,
        count(0) as productBatchCount
      from
        (
          whatsfresh.product_batch_ingredients pbi
          join whatsfresh.product_batches pb on ((pbi.product_batch_id = pb.id))
        )
      where
        (pb.active = 'Y')
      group by
        pbi.ingredient_batch_id
    ) pbi on ((ib.id = pbi.ingredient_batch_id))
  )
where
  (
    (ib.active = 1)
    and (i.active = 1)
    and (it.active = 1)
    and (ib.purchase_date >= (now() - interval 7 year))
  )
order by
  ib.purchase_date desc,
  ib.batch_number
