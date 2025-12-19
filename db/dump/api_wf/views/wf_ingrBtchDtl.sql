create or replace view wf_ingrBtchDtl as
select
  it.name as ingrTypeName,
  i.name as ingrName,
  i.code as ingrCode,
  ifnull(ib.batch_number, 'No Batches') as ingrBtchNbr,
  i.grams_per_ounce as gmsPerOz,
  i.description as ingrDesc,
  i.default_measure_unit as dfltMeasId,
  i.default_vendor as dfltVndrId,
  ifnull(ib.lot_number, '') as ingrLotNbr,
  (
    ifnull(date_format(ib.purchase_date, '%Y-%m-%d'), '') collate utf8mb4_unicode_ci
  ) as purchDate,
  ifnull(ib.purchase_quantity, '') as purchQty,
  whatsfresh.f_measure (ib.measure_id) as purchMeas,
  ib.unit_quantity as unitQty,
  ib.unit_price as unitPrice,
  cast(
    (
      ifnull(ib.unit_price, 0) / ifnull(ib.unit_quantity, 1)
    ) as decimal(9, 4)
  ) as unitRate,
  ifnull(
    concat(
      ib.purchase_quantity,
      ' @ ',
      concat('$', format(ifnull(ib.unit_price, 0), 2)),
      ' per ',
      (trim(round(ib.unit_quantity, 2)) + 0),
      ' ',
      whatsfresh.f_measure (ib.measure_id)
    ),
    ''
  ) as purchDtl,
  concat(
    '$',
    format(
      ifnull((ib.purchase_quantity * ib.unit_price), 0),
      2
    )
  ) as purchAmt,
  ifnull((ib.purchase_quantity * ib.unit_price), 0) as purchTotalAmt,
  whatsfresh.f_vendor (ib.vendor_id) as vndrName,
  whatsfresh.f_brand (ib.brand_id) as brndName,
  ifnull(date_format(ib.best_by_date, '%Y-%m-%d'), '') as bestByDate,
  ifnull(pbi.prd_btch_cnt, 0) as prdBtchCnt,
  ib.comments as comments,
  concat(
    ib.purchase_date,
    ' : ',
    whatsfresh.f_vendor (ib.vendor_id)
  ) as shopEvent,
  i.active as ingrActv,
  ib.active as ingrBtchActv,
  it.active as ingrTypeActv,
  i.account_id as account_id,
  ib.id as ingredient_batch_id,
  i.id as ingredient_id,
  it.id as ingredient_type_id,
  ib.vendor_id as vendor_id,
  ib.brand_id as brand_id,
  cast(ib.measure_id as signed) as measure_id,
  ib.shop_event_id as shop_event_id
from
  (
    (
      (
        whatsfresh.ingredients i
        left join (
          select
            a.id as id,
            a.ingredient_id as ingredient_id,
            a.shop_event_id as shop_event_id,
            a.vendor_id as vendor_id,
            a.brand_id as brand_id,
            a.lot_number as lot_number,
            a.batch_number as batch_number,
            a.purchase_date as purchase_date,
            a.purchase_quantity as purchase_quantity,
            a.global_measure_unit_id as global_measure_unit_id,
            a.measure_id as measure_id,
            a.unit_quantity as unit_quantity,
            a.unit_price as unit_price,
            a.purchase_total_amount as purchase_total_amount,
            a.best_by_date as best_by_date,
            a.comments as comments,
            a.created_at as created_at,
            a.created_by as created_by,
            a.updated_at as updated_at,
            a.updated_by as updated_by,
            a.deleted_at as deleted_at,
            a.deleted_by as deleted_by,
            a.oldUUID as oldUUID,
            a.active as active
          from
            whatsfresh.ingredient_batches a
          where
            (
              year(a.purchase_date) >= year((now() - interval 7 year))
            )
        ) ib on ((i.id = ib.ingredient_id))
      )
      left join whatsfresh.ingredient_types it on ((i.ingredient_type_id = it.id))
    )
    left join (
      select
        whatsfresh.product_batch_ingredients.ingredient_batch_id as ingredient_batch_id,
        count(0) as prd_btch_cnt
      from
        whatsfresh.product_batch_ingredients
      group by
        whatsfresh.product_batch_ingredients.ingredient_batch_id
    ) pbi on ((ib.id = pbi.ingredient_batch_id))
  )
