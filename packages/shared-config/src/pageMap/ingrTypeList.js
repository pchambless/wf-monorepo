export default {
  "id": "ingrTypeList",
  "title": "Ingredient Types",
  "schema": "whatsfresh",
  "table": "ingredient_types",
  "section": "ingredients",
  "icon": "Category",
  "color": "pink",
  "parentIdField": "acctID",
  "childEntity": "ingrList",
  "childIdField": "ingrTypeID",
  "keyField": "ingrTypeID",
  "actions": {
    "rowActions": [],
    "tableActions": []
  },
  "columns": {
    "ingrTypeID": {
      "id": 1,
      "field": "ingrTypeID",
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
    "ingrTypeName": {
      "id": 2,
      "field": "ingrTypeName",
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
    "ingrTypeDesc": {
      "id": 3,
      "field": "ingrTypeDesc",
      "db_column": "description",
      "headerName": "Description",
      "width": 150,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": false,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "acctID": {
      "id": 4,
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