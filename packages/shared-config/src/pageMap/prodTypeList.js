export default {
  "id": "prodTypeList",
  "title": "Product Types",
  "schema": "whatsfresh",
  "table": "product_types",
  "section": "products",
  "icon": "Category",
  "color": "blue",
  "parentIdField": "acctID",
  "childEntity": "prodList",
  "childIdField": "prodTypeID",
  "keyField": "prodTypeID",
  "actions": {
    "rowActions": [],
    "tableActions": []
  },
  "columns": {
    "prodTypeID": {
      "id": 1,
      "field": "prodTypeID",
      "db_column": "id",
      "headerName": "Type I D",
      "width": 150,
      "type": "text",
      "group": 1,
      "hidden": true,
      "required": false,
      "primaryKey": true,
      "editable": false,
      "searchable": false
    },
    "prodTypeName": {
      "id": 2,
      "field": "prodTypeName",
      "db_column": "name",
      "headerName": "Type Name",
      "width": 200,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": true,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "acctID": {
      "id": 3,
      "field": "acctID",
      "db_column": "account_id",
      "headerName": "ID",
      "width": 150,
      "type": "text",
      "group": 1,
      "hidden": true,
      "required": false,
      "primaryKey": false,
      "editable": false,
      "searchable": false
    }
  }
};