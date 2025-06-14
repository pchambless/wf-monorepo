export default {
  "id": "measList",
  "title": "Measures",
  "schema": "whatsfresh",
  "table": "measures",
  "section": "reference",
  "icon": "Scale",
  "color": "gray",
  "parentIdField": "acctID",
  "keyField": "measID",
  "actions": {
    "rowActions": [],
    "tableActions": []
  },
  "columns": {
    "measID": {
      "id": 1,
      "field": "measID",
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
    "name": {
      "id": 2,
      "field": "name",
      "db_column": "name",
      "headerName": "Name",
      "width": 200,
      "type": "text",
      "group": 1,
      "hidden": false,
      "required": true,
      "primaryKey": false,
      "editable": true,
      "searchable": false
    },
    "abbrev": {
      "id": 3,
      "field": "abbrev",
      "db_column": "abbrev",
      "headerName": "Abbreviation",
      "width": 100,
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