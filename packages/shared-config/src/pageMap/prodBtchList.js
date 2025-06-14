export default {
  "id": "prodBtchList",
  "title": "Product Batches",
  "schema": "whatsfresh",
  "table": "product_batches",
  "section": "products",
  "icon": "Inventory",
  "color": "blue",
  "parentIdField": "prodID",
  "keyField": "prodBtchID",
  "columns": {
    "prodBtchID": {
      "id": 1,
      "field": "prodBtchID",
      "db_column": "id",
      "headerName": "Btch I D",
      "width": 150,
      "type": "number",
      "group": 1,
      "hidden": true,
      "required": false,
      "primaryKey": true,
      "editable": false,
      "searchable": false
    },
    "btchNbr": {
      "id": 2,
      "field": "btchNbr",
      "db_column": "batch_number",
      "headerName": "Batch Number",
      "width": 120,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": true,
      "primaryKey": false,
      "editable": true,
      "searchable": true
    },
    "btchLoc": {
      "id": 3,
      "field": "btchLoc",
      "db_column": "location",
      "headerName": "Location",
      "width": 150,
      "type": "text",
      "group": 2,
      "hidden": false,
      "required": false,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "btchQty": {
      "id": 4,
      "field": "btchQty",
      "db_column": "batch_quantity",
      "headerName": "Quantity",
      "width": 100,
      "type": "decimal",
      "group": 2,
      "hidden": false,
      "required": false,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "measID": {
      "id": 5,
      "field": "measID",
      "db_column": "global_measure_unit_id",
      "headerName": "Measure",
      "width": 120,
      "type": "select",
      "group": 2,
      "hidden": false,
      "required": false,
      "primaryKey": false,
      "editable": true,
      "searchable": false,
      "entity": "measList",
      "valueField": "measID",
      "displayField": "name"
    },
    "comments": {
      "id": 6,
      "field": "comments",
      "db_column": "comments",
      "headerName": "Comments",
      "width": 150,
      "type": "multiline",
      "group": 1,
      "hidden": true,
      "required": false,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "prodID": {
      "id": 7,
      "field": "prodID",
      "db_column": "product_id",
      "headerName": "ID",
      "width": 150,
      "type": "select",
      "group": 1,
      "hidden": true,
      "required": false,
      "primaryKey": false,
      "editable": false,
      "searchable": false,
      "entity": "prodList",
      "valueField": "prodID",
      "displayField": "prodName"
    }
  }
};