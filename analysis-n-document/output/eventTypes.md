```mermaid
flowchart LR

  subgraph AUTH
    userLogin["page:AuthLayout<br>userLogin<br>[::userEmail, ::enteredPassword]"]
    userAcctList["ui:select<br>userAcctList<br>[::userID]"]
  end

  subgraph DEVELOPMENT
    archDashboard["page:development<br>archDashboard<br>[:]"]
  end

  subgraph INGREDIENTS
    ingrTypeList["page:CrudLayout<br>ingrTypeList<br>[::acctID]"]
    ingrList["page:CrudLayout<br>ingrList<br>[::acctID, ::ingrTypeID]"]
    ingrBtchList["page:CrudLayout<br>ingrBtchList<br>[::ingrID]"]
  end

  subgraph PRODUCTS
    prodTypeList["page:CrudLayout<br>prodTypeList<br>[::acctID]"]
    prodList["page:CrudLayout<br>prodList<br>[::prodTypeID]"]
    taskList["page:CrudLayout<br>taskList<br>[::prodTypeID]"]
    prodBtchList["page:CrudLayout<br>prodBtchList<br>[::prodID]"]
    rcpeList["page:RecipeLayout<br>rcpeList<br>[::prodID]"]
  end

  subgraph SELECT
    prodListAll["ui:Select<br>prodListAll<br>[::acctID]"]
  end

  subgraph REFERENCE
    brndList["page:CrudLayout<br>brndList<br>[::acctID]"]
    vndrList["page:CrudLayout<br>vndrList<br>[::acctID]"]
    wrkrList["page:CrudLayout<br>wrkrList<br>[::acctID]"]
    measList["page:CrudLayout<br>measList<br>[::acctID]"]
  end

  subgraph MAPPING
    btchMapping["page:MappingLayout<br>btchMapping<br>[::prodBtchID]"]
    gridRcpe["data:Grid<br>gridRcpe<br>[::prodID]"]
    gridMapped["ui:Grid<br>gridMapped<br>[::prodBtchID, ::ingrID, :prodRcpeID]"]
    gridAvailable["ui:Grid<br>gridAvailable<br>[::prodBtchID, ::ingrID]"]
  end

  subgraph REPORTS
    rpt-WrkSht-Ingr["report:worksheet<br>rpt-WrkSht-Ingr<br>[::prodBtchID]"]
    rpt-WrkSht-Task["report:worksheet<br>rpt-WrkSht-Task<br>[::prodBtchID]"]
  end

  subgraph PLANS
    plan-management["page:PlanManagement<br>plan-management<br>[:]"]
    SelPlanStatus["ui:Select<br>SelPlanStatus<br>[:]"]
    planDetailTab["tab:PlanDetail<br>planDetailTab<br>[:]"]
    planCommunicationTab["tab:PlanCommunication<br>planCommunicationTab<br>[:]"]
    planImpactTab["tab:PlanImpacts<br>planImpactTab<br>[:]"]
    planList["grid:Plans<br>planList<br>[:]"]
    planCommunicationList["grid:PlanCommunications<br>planCommunicationList<br>[::planID]"]
    planImpactList["grid:PlanImpacts<br>planImpactList<br>[::planID]"]
    planDetailList["api:query<br>planDetailList<br>[::planID]"]
  end

  subgraph WORKFLOWS
    workflow:updatePlan["workflow<br>updatePlan"]
    workflow:createPlan["workflow<br>createPlan"]
    workflow:validateAccess["workflow<br>validateAccess"]
    workflow:refreshContext["workflow<br>refreshContext"]
    workflow:updateRecord["workflow<br>updateRecord"]
    workflow:trackImpact["workflow<br>trackImpact"]
    workflow:createRecord["workflow<br>createRecord"]
    workflow:createCommunication["workflow<br>createCommunication"]
  end

  userAcctList -->|acctID| ingrTypeList
  userAcctList -->|acctID| prodTypeList
  userAcctList -->|acctID| brndList
  userAcctList -->|acctID| vndrList
  userAcctList -->|acctID| wrkrList
  userAcctList -->|acctID| measList
  ingrTypeList -->|ingrTypeID| ingrList
  ingrList -->|ingrID| ingrBtchList
  prodTypeList -->|prodTypeID| prodList
  prodTypeList -->|prodTypeID| taskList
  prodList -->|prodID| prodBtchList
  prodList -->|prodID| rcpeList
  prodBtchList -->|prodBtchID| btchMapping
  plan-management --> SelPlanStatus
  SelPlanStatus --> planList
  planDetailTab --> planDetailList
  planCommunicationTab --> planCommunicationList
  planImpactTab --> planImpactList
  planList -->|id| planDetailTab
  planList -->|id| planCommunicationTab
  planList -->|id| planImpactTab
  planList -.->|direct| workflow:updatePlan
  planList -.->|direct| workflow:createPlan
  planList -.->|onSelect| workflow:validateAccess
  planList -.->|onSelect| workflow:refreshContext
  planList -.->|onUpdate| workflow:updateRecord
  planList -.->|onUpdate,onCreate| workflow:trackImpact
  planList -.->|onCreate| workflow:createRecord
  planCommunicationList -.->|direct| workflow:createCommunication
  planCommunicationList -.->|onSelect| workflow:validateAccess
  planCommunicationList -.->|onSelect| workflow:refreshContext
  planCommunicationList -.->|onUpdate| workflow:updateRecord
  planCommunicationList -.->|onUpdate,onCreate| workflow:trackImpact
  planCommunicationList -.->|onCreate| workflow:createRecord
  planDetailList -.->|onSelect| workflow:validateAccess
  planDetailList -.->|onSelect| workflow:refreshContext
  planDetailList -.->|onUpdate| workflow:updateRecord
  planDetailList -.->|onUpdate,onCreate| workflow:trackImpact
  planDetailList -.->|onCreate| workflow:createRecord
  class userLogin page:AuthLayout;
  class userAcctList ui:select;
  class archDashboard page:development;
  class ingrTypeList page:CrudLayout;
  class ingrList page:CrudLayout;
  class ingrBtchList page:CrudLayout;
  class prodTypeList page:CrudLayout;
  class prodList page:CrudLayout;
  class prodListAll ui:Select;
  class taskList page:CrudLayout;
  class prodBtchList page:CrudLayout;
  class brndList page:CrudLayout;
  class vndrList page:CrudLayout;
  class wrkrList page:CrudLayout;
  class measList page:CrudLayout;
  class rcpeList page:RecipeLayout;
  class btchMapping page:MappingLayout;
  class gridRcpe data:Grid;
  class gridMapped ui:Grid;
  class gridAvailable ui:Grid;
  class rpt-WrkSht-Ingr report:worksheet;
  class rpt-WrkSht-Task report:worksheet;
  class plan-management page:PlanManagement;
  class SelPlanStatus ui:Select;
  class planDetailTab tab:PlanDetail;
  class planCommunicationTab tab:PlanCommunication;
  class planImpactTab tab:PlanImpacts;
  class planList grid:Plans;
  class planCommunicationList grid:PlanCommunications;
  class planImpactList grid:PlanImpacts;
  class planDetailList api:query;
  class workflow:updatePlan workflow;
  class workflow:createPlan workflow;
  class workflow:validateAccess workflow;
  class workflow:refreshContext workflow;
  class workflow:updateRecord workflow;
  class workflow:trackImpact workflow;
  class workflow:createRecord workflow;
  class workflow:createCommunication workflow;
  classDef page:AuthLayout fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef ui:select fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef page:development fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef page:CrudLayout fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef ui:Select fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef page:RecipeLayout fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef page:MappingLayout fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef data:Grid fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef ui:Grid fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef report:worksheet fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef page:PlanManagement fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef tab:PlanDetail fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef tab:PlanCommunication fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef tab:PlanImpacts fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef grid:Plans fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef grid:PlanCommunications fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef grid:PlanImpacts fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef api:query fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
  classDef workflow fill:#f0f0f0,stroke:#333,stroke-width:1px,color:#000;
```