```mermaid
flowchart LR

  subgraph AUTH
    userLogin["page:AuthLayout<br>userLogin<br>[::userEmail, ::enteredPassword]"]
    userAcctList["ui:select<br>userAcctList<br>[::userID]"]
  end

  subgraph INGREDIENTS
    ingrTypeList["page:CrudLayout<br>ingrTypeList<br>[::acctID]"]
    ingrList["page:CrudLayout<br>ingrList<br>[::acctID, ::ingrTypeID]"]
    ingrBtchList["page:CrudLayout<br>ingrBtchList<br>[::ingrID]"]
  end

  subgraph PRODUCTS
    prodTypeList["page:CrudLayout<br>prodTypeList<br>[::acctID]"]
    prodList["page:CrudLayout<br>prodList<br>[::acctID, ::prodTypeID]"]
    taskList["page:CrudLayout<br>taskList<br>[::prodTypeID]"]
    prodBtchList["page:CrudLayout<br>prodBtchList<br>[::prodID]"]
    rcpeList["page:RecipeLayout<br>rcpeList<br>[::prodID]"]
  end

  subgraph REFERENCE
    brndList["page:CrudLayout<br>brndList<br>[::acctID]"]
    vndrList["page:CrudLayout<br>vndrList<br>[::acctID]"]
    wrkrList["page:CrudLayout<br>wrkrList<br>[::acctID]"]
    measList["page:CrudLayout<br>measList<br>[::acctID]"]
  end

  subgraph MAPPING
    btchMapping["page:MappingLayout<br>btchMapping<br>[::prodBtchID]"]
    btchMapRcpeList["data:Grid<br>btchMapRcpeList<br>[::prodID]"]
    btchMapMapped["ui:Grid<br>btchMapMapped<br>[::prodBtchID, ::ingrID]"]
    btchMapAvailable["ui:Grid<br>btchMapAvailable<br>[::prodBtchID, ::ingrID]"]
  end

  userAcctList -->|acctID| ingrTypeList
  userAcctList -->|acctID| prodTypeList
  userAcctList -->|acctID| brndList
  userAcctList -->|acctID| vndrList
  userAcctList -->|acctID| wrkrList
  userAcctList -->|acctID| measList
  ingrTypeList -->|ingrTypeID| ingrList
  ingrList -->|ingrID| ingrBtchList
  ingrBtchList -->|ingrBtchID| btchMapping
  prodTypeList -->|prodTypeID| prodList
  prodTypeList -->|prodTypeID| taskList
  prodList -->|prodID| prodBtchList
  prodList -->|prodID| rcpeList
  prodList -->|prodID| btchMapping
  prodBtchList -->|prodBtchID| btchMapping
  class userLogin page:AuthLayout;
  class userAcctList ui:select;
  class ingrTypeList page:CrudLayout;
  class ingrList page:CrudLayout;
  class ingrBtchList page:CrudLayout;
  class prodTypeList page:CrudLayout;
  class prodList page:CrudLayout;
  class taskList page:CrudLayout;
  class prodBtchList page:CrudLayout;
  class brndList page:CrudLayout;
  class vndrList page:CrudLayout;
  class wrkrList page:CrudLayout;
  class measList page:CrudLayout;
  class rcpeList page:RecipeLayout;
  class btchMapping page:MappingLayout;
  class btchMapRcpeList data:Grid;
  class btchMapMapped ui:Grid;
  class btchMapAvailable ui:Grid;
  classDef page:AuthLayout fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef ui:select fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef page:CrudLayout fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef page:RecipeLayout fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef page:MappingLayout fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef data:Grid fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef ui:Grid fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
```