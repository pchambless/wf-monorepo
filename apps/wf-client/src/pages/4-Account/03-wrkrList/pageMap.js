/**
 * PageMap for wrkrList
 * Generated on 2025-05-16T17:17:10.307Z
 */
import accountStore from '../../../stores/accountStore';

// Direct object export - no builder pattern
export const pageMap = {
  "id": "wrkr",
  "pageConfig": {
    "id": "wrkr",
    "idField": "wrkrID",
    "table": "workers",
    "listEvent": "wrkrList",
    "title": "Wrkr",
    "navigateTo": "/wrkr",
    "parentIdField": "acctID"
  },
  "columnMap": [
    {
      "field": "wrkrID",
      "label": "Wrkr ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "primary": true,
      "hideInTable": true,
      "hideInForm": true
    },
    {
      "field": "wrkrName",
      "label": "Wrkr Name",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 180,
      "editable": true,
      "searchable": true,
      "group": 1
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
    "listEvent": "wrkrList",
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
