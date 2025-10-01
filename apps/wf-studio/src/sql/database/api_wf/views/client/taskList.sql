/*
* @view taskList
* @description Task listing for WhatsFresh production processes
* @schema whatsfresh
* @table tasks
*/
CREATE OR REPLACE VIEW api_wf.taskList AS
SELECT 
  a.id AS taskID,
  a.name AS taskName,
  a.description AS taskDesc,
  a.ordr AS taskOrder,
  a.product_type_id AS prodTypeID
FROM whatsfresh.tasks a
WHERE a.active = 1
ORDER BY a.product_type_id, a.ordr;