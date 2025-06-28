export default {
  "nodes": [
    {
      "id": "userLogin",
      "label": "userLogin",
      "category": "auth",
      "meta": {
        "method": "GET",
        "purpose": "Authenticate user login"
      }
    },
    {
      "id": "userAcctList",
      "label": "userAcctList",
      "category": "select",
      "meta": {
        "selWidget": "SelUserAcct",
        "method": "GET",
        "purpose": "Get accounts accessible to user"
      }
    },
    {
      "id": "ingrTypeList",
      "label": "ingrTypeList",
      "category": "crud",
      "meta": {
        "dbTable": "ingredient_types",
        "selWidget": "SelIngrType",
        "method": "GET",
        "purpose": "Get ingredient types for an account"
      }
    },
    {
      "id": "ingrList",
      "label": "ingrList",
      "category": "crud",
      "meta": {
        "dbTable": "ingredients",
        "selWidget": "SelIngr",
        "method": "GET",
        "purpose": "Get ingredients for an account"
      }
    },
    {
      "id": "ingrBtchList",
      "label": "ingrBtchList",
      "category": "crud",
      "meta": {
        "dbTable": "ingredient_batches",
        "selWidget": "SelIngrBtch",
        "method": "GET",
        "purpose": "Get ingredient batches for a product"
      }
    },
    {
      "id": "prodTypeList",
      "label": "prodTypeList",
      "category": "crud",
      "meta": {
        "dbTable": "product_types",
        "selWidget": "SelProdType",
        "method": "GET",
        "purpose": "Get product types for an account"
      }
    },
    {
      "id": "prodList",
      "label": "prodList",
      "category": "crud",
      "meta": {
        "dbTable": "products",
        "selWidget": "SelProd",
        "method": "GET",
        "purpose": "Get products for an account"
      }
    },
    {
      "id": "taskList",
      "label": "taskList",
      "category": "crud",
      "meta": {
        "dbTable": "tasks",
        "method": "GET",
        "purpose": "Get tasks for batches"
      }
    },
    {
      "id": "prodBtchList",
      "label": "prodBtchList",
      "category": "crud",
      "meta": {
        "dbTable": "product_batches",
        "selWidget": "SelProdBtch",
        "method": "GET",
        "purpose": "Get product batches for a product"
      }
    },
    {
      "id": "brndList",
      "label": "brndList",
      "category": "crud",
      "meta": {
        "dbTable": "brands",
        "selWidget": "SelBrnd",
        "method": "GET",
        "purpose": "Get brands for an account"
      }
    },
    {
      "id": "vndrList",
      "label": "vndrList",
      "category": "crud",
      "meta": {
        "dbTable": "vendors",
        "selWidget": "SelVndr",
        "method": "GET",
        "purpose": "Get vendors for an account"
      }
    },
    {
      "id": "wrkrList",
      "label": "wrkrList",
      "category": "crud",
      "meta": {
        "dbTable": "workers",
        "selWidget": "SelWrkr",
        "method": "GET",
        "purpose": "Get workers for an account"
      }
    },
    {
      "id": "measList",
      "label": "measList",
      "category": "crud",
      "meta": {
        "dbTable": "measures",
        "method": "GET",
        "purpose": "Get measurement units"
      }
    },
    {
      "id": "rcpeList",
      "label": "rcpeList",
      "category": "rcpe",
      "meta": {
        "dbTable": "product_recipes",
        "method": "GET",
        "purpose": "Get recipes for an account"
      }
    },
    {
      "id": "btchMapList",
      "label": "btchMapList",
      "category": "uncategorized",
      "meta": {
        "method": "GET",
        "purpose": "Main batch mapping page"
      }
    },
    {
      "id": "btchMapIngrList",
      "label": "btchMapIngrList",
      "category": "uncategorized",
      "meta": {
        "method": "GET",
        "purpose": "Get recipe ingredients for a product"
      }
    },
    {
      "id": "btchMapMapped",
      "label": "btchMapMapped",
      "category": "uncategorized",
      "meta": {
        "method": "GET",
        "purpose": "Ingr batches mapped to an ingredient for a product batch"
      }
    },
    {
      "id": "btchMapAvailable",
      "label": "btchMapAvailable",
      "category": "uncategorized",
      "meta": {
        "method": "GET",
        "purpose": "Ingr batches available for mapping to a product batch"
      }
    }
  ],
  "edges": [
    {
      "from": "userLogin",
      "to": "userAcctList",
      "label": "",
      "type": ""
    },
    {
      "from": "userAcctList",
      "to": "ingrTypeList",
      "label": "",
      "type": ""
    },
    {
      "from": "userAcctList",
      "to": "prodTypeList",
      "label": "",
      "type": ""
    },
    {
      "from": "userAcctList",
      "to": "brndList",
      "label": "",
      "type": ""
    },
    {
      "from": "userAcctList",
      "to": "vndrList",
      "label": "",
      "type": ""
    },
    {
      "from": "userAcctList",
      "to": "wrkrList",
      "label": "",
      "type": ""
    },
    {
      "from": "userAcctList",
      "to": "measList",
      "label": "",
      "type": ""
    },
    {
      "from": "ingrTypeList",
      "to": "ingrList",
      "label": "",
      "type": ""
    },
    {
      "from": "ingrList",
      "to": "ingrBtchList",
      "label": "",
      "type": ""
    },
    {
      "from": "ingrBtchList",
      "to": "btchmapAvailable",
      "label": "",
      "type": ""
    },
    {
      "from": "ingrBtchList",
      "to": "btchMapMapped",
      "label": "",
      "type": ""
    },
    {
      "from": "prodTypeList",
      "to": "prodList",
      "label": "",
      "type": ""
    },
    {
      "from": "prodTypeList",
      "to": "taskList",
      "label": "",
      "type": ""
    },
    {
      "from": "prodList",
      "to": "prodBtchList",
      "label": "",
      "type": ""
    },
    {
      "from": "prodList",
      "to": "rcpeList",
      "label": "",
      "type": ""
    },
    {
      "from": "taskList",
      "to": "prodBtchTaskList",
      "label": "",
      "type": ""
    },
    {
      "from": "prodBtchList",
      "to": "btchMapList",
      "label": "",
      "type": ""
    },
    {
      "from": "prodBtchList",
      "to": "prodBtchTaskList",
      "label": "",
      "type": ""
    },
    {
      "from": "brndList",
      "to": "ingrBtchList",
      "label": "",
      "type": ""
    },
    {
      "from": "vndrList",
      "to": "ingrBtchList",
      "label": "",
      "type": ""
    },
    {
      "from": "wrkrList",
      "to": "prodBtchTaskList",
      "label": "",
      "type": ""
    },
    {
      "from": "rcpeList",
      "to": "btchMapList",
      "label": "",
      "type": ""
    },
    {
      "from": "btchMapList",
      "to": "btchMapIngrList",
      "label": "",
      "type": ""
    },
    {
      "from": "btchMapList",
      "to": "btchMapMapped",
      "label": "",
      "type": ""
    },
    {
      "from": "btchMapList",
      "to": "btchMapAvailable",
      "label": "",
      "type": ""
    }
  ]
};