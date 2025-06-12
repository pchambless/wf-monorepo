/**
 * PageMap for vndrList
 * Generated on 2025-05-16T17:17:10.301Z
 */
import accountStore from '../../../stores/accountStore';

// Direct object export - no builder pattern
export const pageMap = {
  "id": "vndr",
  "pageConfig": {
    "id": "vndr",
    "idField": "vndrID",
    "table": "vendors",
    "listEvent": "vndrList",
    "title": "Vendor",
    "navigateTo": "/vndr",
    "parentIdField": "acctID"
  },
  "columnMap": [
    {
      "field": "vndrID",
      "label": "Vndr ID",
      "displayType": "number",
      "dataType": "INT",
      "width": 80,
      "editable": false,
      "primary": true,
      "hideInTable": true,
      "hideInForm": true
    },
    {
      "field": "vndrName",
      "label": "Vndr Name",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 180,
      "editable": true,
      "searchable": true,
      "group": 1
    },
    {
      "field": "vndrContactName",
      "label": "Vndr Contact Name",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 180,
      "editable": true,
      "group": 1
    },
    {
      "field": "vndrContactPhone",
      "label": "Vndr Contact Phone",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "vndrContactEmail",
      "label": "Vndr Contact Email",
      "displayType": "text",
      "dataType": "VARCHAR",
      "width": 150,
      "editable": true,
      "group": 2
    },
    {
      "field": "vndrComments",
      "label": "Vndr Comments",
      "displayType": "multiLine",
      "dataType": "VARCHAR",
      "width": 240,
      "editable": true,
      "multiLine": true,
      "group": 2,
      "hideInTable": true
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
    "listEvent": "vndrList",
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
