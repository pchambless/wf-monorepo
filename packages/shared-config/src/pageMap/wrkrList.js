export default {
  "id": "wrkrList",
  "title": "Workers",
  "schema": "whatsfresh",
  "table": "workers",
  "section": "reference",
  "icon": "Person",
  "color": "gray",
  "parentIdField": "acctID",
  "keyField": "wrkrID",
  "actions": {
    "rowActions": [],
    "tableActions": []
  },
  "columns": {
    "wrkrID": {
      "id": 1,
      "field": "wrkrID",
      "db_column": "id",
      "headerName": "ID",
      "width": 150,
      "type": "text",
      "group": 1,
      "hidden": true,
      "required": false,
      "primaryKey": true,
      "editable": false,
      "searchable": false
    },
    "wrkrName": {
      "id": 2,
      "field": "wrkrName",
      "db_column": "name",
      "headerName": "Worker Name",
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