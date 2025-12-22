create or replace view wf_btchSumry as
select
  a.acctName as acctName,
  year(a.btchDate) as yr,
  sum(
    (
      case
        when (a.btchCat = 'Ingr') then 1
        else 0
      end
    )
  ) as IngrCount,
  sum(
    (
      case
        when (a.btchCat = 'Prod') then 1
        else 0
      end
    )
  ) as ProdCount
from
  wf_btchTrace a
group by
  a.acctName,
  year(a.btchDate)
order by
  year(a.btchDate) desc
