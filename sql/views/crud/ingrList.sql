/*
* @view ingrList
* @description Ingredient listing for WhatsFresh
* @schema whatsfresh
* @table ingredients
*/
CREATE OR REPLACE VIEW api_wf.ingrList AS
SELECT 
  a.id AS ingrID, -- PK; sys; type:number
  a.name AS ingrName, -- req; type:text; label:Ingredient Name; width:200; grp:1; searchable
  a.code AS ingrCode, -- type:text; label:Code; width:100; grp:1; unique
  a.description AS ingrDesc, -- type:multiLine; label:Description; tableHide
  a.default_measure_unit AS measID, -- type:select; label:Default Measure; width:120; entity:measList; valField:measID; dispField:name; tableHide; grp:2
  a.default_vendor AS vndrID, -- type:select; label:Default Vendor; width:150; entity:vndrList; valField:vndrID; dispField:vndrName; tableHide; grp:2
  a.grams_per_ounce AS ingrGrmsPerOz, -- type:decimal; label:Grams/Oz; width:100; dec:10,2; grp:3
  a.ingredient_type_id AS ingrTypeID -- parentKey; sys; type:select; entity:ingrTypeList; valField:ingrTypeID; dispField:ingrTypeName
FROM whatsfresh.ingredients a
ORDER BY a.ingredient_type_id, a.name;