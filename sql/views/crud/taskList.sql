/*
* @view taskList
* @description Task listing for WhatsFresh production processes
* @schema whatsfresh
* @table tasks
*/
CREATE OR REPLACE VIEW api_wf.taskList AS
SELECT 
  a.id AS taskID, -- PK; sys; type:number
  a.name AS taskName, -- req; type:text; label:Task Name; width:200; grp:1; searchable
  a.description AS taskDesc, -- type:multiLine; label:Description; tableHide
  a.ordr AS taskOrder, -- type:number; label:Order; width:80; grp:1
  a.product_type_id AS prodTypeID -- parentKey; sys; type:select; entity:prodTypeList; valField:prodTypeID; dispField:prodTypeName
FROM whatsfresh.tasks a
WHERE a.active = 'Y'
ORDER BY a.product_type_id, a.ordr;