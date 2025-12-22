create or replace view vw_routePath as
select
  b.id as pageID,
  b.appID as appID,
  a.mono_name as appName,
  b.pageName as pageName,
  a.name as Name,
  concat('/', a.mono_name, '/', b.pageName) as routePath
from
  (
    app a
    join page_registry b on ((a.id = b.appID))
  )
