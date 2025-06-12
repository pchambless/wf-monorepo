/**
 * PageMap for brndList
 * Generated on 2025-05-16T17:17:10.273Z
 */
import accountStore from '../../../stores/accountStore';

// Direct object export - no builder pattern
export const pageMap = {
  "id": "brnd",
  "pageConfig": {
    "id": "brnd",
    "idField": "brndID",
    "table": "brands",
    "listEvent": "brndList",
    "title": "Brand",
    "navigateTo": "/brnd",
    "parentIdField": "acctID"
  },
  "columnMap": [
    {
      "field": "brndID",
      "label": "Brnd ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "primary": true,
      "hideInTable": true,
      "hideInForm": true
    },
    {
      "field": "brndName",
      "label": "Brnd Name",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 180,
      "editable": true,
      "searchable": true,
      "group": 1
    },
    {
      "field": "brndComments",
      "label": "Brnd Comments",
      "displayType": "multiLine",
      "dataType": "VARCHAR",
      "width": 240,
      "editable": true,
      "multiLine": true,
      "group": 2,
      "hideInTable": true
    },
    {
      "field": "brndURL",
      "label": "Brnd U R L",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "acctID",
      "label": "Acct ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "hideInTable": true,
      "hideInForm": true
    }
  ],
  "fetch": {
    "listEvent": "brndList",
    "params": {
      ":acctID": 1
    }
  }
};

// Function that resolves route parameters
export const getPageMap = (routeParams = {}) => {
  const resolvedParams = {
    ...routeParams,
    acctID: routeParams.acctID || accountStore.currentAcctID || 1
  };
  
  // Create a new pageMap with resolved parameters
  return {
    ...pageMap,
    fetch: {
      ...pageMap.fetch,
      params: {
        ...pageMap.fetch.params,
        ':acctID': resolvedParams.acctID
      }
    }
  };
};

export default getPageMap;
