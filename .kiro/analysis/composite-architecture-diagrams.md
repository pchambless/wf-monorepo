# Composite Architecture - Visual Diagrams

## 1. Data Flow Architecture

```mermaid
graph TB
    subgraph Database["Database Layer"]
        EC[eventComposite<br/>Reusable Templates]
        PC[pageComponents<br/>Page Instances]
        EPC[eventPageConfig<br/>Page Overrides]
        PR[page_registry<br/>Page Metadata]
    end

    subgraph StoredProc["sp_pageStructure"]
        MERGE[Merge Composite<br/>+ Page Overrides]
        TRANSFORM[Transform to<br/>Hierarchical JSON]
    end

    subgraph Frontend["Universal App"]
        FETCH[fetchPageStructure]
        RENDER[PageRenderer]
        COMP[Component Factory]
    end

    PC -->|pageID, composite_id| MERGE
    EC -->|composite template| MERGE
    EPC -->|page overrides| MERGE
    PR -->|page metadata| MERGE

    MERGE --> TRANSFORM
    TRANSFORM -->|Structured JSON| FETCH
    FETCH --> RENDER
    RENDER --> COMP

    style EC fill:#e1f5ff
    style PC fill:#fff4e1
    style EPC fill:#ffe1e1
    style MERGE fill:#d4edda
    style RENDER fill:#f8d7da
```

## 2. Composite Hierarchy - Page Structure

```mermaid
graph TD
    PAGE[Page: Studio2 Main<br/>pageID: 20<br/>position: root]

    subgraph Composite1["AppNavigation Composite<br/>composite_id: 1<br/>position: 01,01,00,left"]
        SEL1[Select: SelApp<br/>position: 01,01,00,left<br/>relative to composite]
        SEL2[Select: SelAppPage<br/>position: 01,02,00,left<br/>relative to composite]
    end

    subgraph Composite2["CRUDGrid Composite<br/>composite_id: 5<br/>position: 02,01,00,left"]
        GRID[Grid: brndGrid<br/>position: 01,01,00,left<br/>relative to composite]
    end

    subgraph Composite3["CRUDFormModal Composite<br/>composite_id: 6<br/>position: Modal (level 0)"]
        FORM[Form: brndForm<br/>position: 01,01,00,left<br/>relative to modal]
        BTN[Button: Submit<br/>position: 02,01,00,right<br/>relative to modal]
    end

    PAGE --> Composite1
    PAGE --> Composite2
    PAGE --> Composite3

    Composite1 --> SEL1
    Composite1 --> SEL2
    Composite2 --> GRID
    Composite3 --> FORM
    Composite3 --> BTN

    style PAGE fill:#f0f0f0,stroke:#333,stroke-width:3px
    style Composite1 fill:#e1f5ff,stroke:#0066cc,stroke-width:2px
    style Composite2 fill:#fff4e1,stroke:#cc6600,stroke-width:2px
    style Composite3 fill:#ffe1f5,stroke:#cc0066,stroke-width:2px
```

## 3. Position Coordinate System - Relative Positioning

```mermaid
graph LR
    subgraph PageGrid["Page Grid (Absolute)"]
        P11["01,01<br/>(AppNav)"]
        P12["01,02"]
        P13["01,03"]
        P21["02,01<br/>(CRUDGrid)"]
        P22["02,02"]
        P23["02,03"]
    end

    subgraph CompGrid["AppNav Internal Grid (Relative)"]
        C11["01,01<br/>(SelApp)"]
        C12["01,02<br/>(SelAppPage)"]
    end

    P11 -.contains.-> CompGrid

    style P11 fill:#e1f5ff,stroke:#0066cc,stroke-width:2px
    style P21 fill:#fff4e1,stroke:#cc6600,stroke-width:2px
    style C11 fill:#b3e0ff
    style C12 fill:#b3e0ff
```

## 4. Data Structure - eventComposite

```mermaid
classDiagram
    class eventComposite {
        +int id
        +string name
        +string title
        +JSON components[]
        +string purpose
    }

    class Component {
        +string type
        +string name
        +string position
        +JSON props
        +JSON triggers[]
        +JSON eventSQL
    }

    class Props {
        +string qryName
        +string labelKey
        +string valueKey
        +JSON fetchParams
    }

    class Trigger {
        +string class
        +string action
        +JSON params
        +JSON content
    }

    eventComposite "1" --> "*" Component : contains
    Component "1" --> "1" Props : has
    Component "1" --> "*" Trigger : has

    note for Component "Position is relative\nto composite container"
```

## 5. sp_pageStructure Output Structure

```mermaid
graph TB
    subgraph Output["sp_pageStructure Returns"]
        PAGE_META[Page Metadata<br/>pageID, pageName, appName]

        subgraph COMPONENTS["components: []"]
            COMP1[Component Object]
            COMP2[Component Object]
            COMP3[Component Object]
        end
    end

    subgraph ComponentObject["Component Structure"]
        ID[id: comp_name]
        TYPE[comp_type: Select]
        POS[position: {row, order, width, align}]
        PROPS[props: {qryName, labelKey...}]
        TRIGS[workflowTriggers: {onClick: [...]}]
        CHILDREN[components: [nested children]]
    end

    PAGE_META --> COMPONENTS
    COMPONENTS --> COMP1
    COMPONENTS --> COMP2
    COMPONENTS --> COMP3

    COMP1 -.structure.-> ComponentObject

    style Output fill:#d4edda
    style ComponentObject fill:#fff3cd
```

## 6. Request Flow - From URL to Render

```mermaid
sequenceDiagram
    participant User
    participant Router
    participant App
    participant API
    participant DB
    participant PageRenderer

    User->>Router: Navigate to /studio2/brands
    Router->>App: Lookup pageID (brands page)
    App->>API: POST /api/execEvent('fetchPageStructure', {pageID: 5})
    API->>DB: CALL sp_pageStructure(5)

    Note over DB: 1. Find pageComponents entries<br/>2. Join eventComposite<br/>3. Merge with eventPageConfig overrides<br/>4. Build hierarchical JSON

    DB-->>API: Structured component tree
    API-->>App: JSON response

    Note over App: fetchConfig.js receives<br/>pre-structured data<br/>(no transformation needed)

    App->>PageRenderer: Pass config object
    PageRenderer->>PageRenderer: Render components recursively<br/>using relative positions
    PageRenderer-->>User: Rendered page
```

## 7. Composite Types - Reusable vs Instance-Specific

```mermaid
graph TB
    subgraph Reusable["Reusable Composites (Complete Config)"]
        NAV[AppNavigation<br/>✓ props<br/>✓ triggers<br/>✓ eventSQL]
        ACTIONS[CRUDActions<br/>✓ props<br/>✓ triggers<br/>✓ eventSQL]
        LOGIN[LoginForm<br/>✓ props<br/>✓ triggers<br/>✓ eventSQL]
    end

    subgraph Templates["Template Composites (Require Overrides)"]
        GRID[CRUDGrid<br/>○ props: null<br/>○ eventSQL: null]
        FORM[CRUDForm<br/>○ props: null<br/>○ eventSQL: null]
    end

    subgraph PageOverrides["eventPageConfig (Page-Specific Data)"]
        BRAND_GRID[brndGrid Override<br/>✓ props: {qryName}<br/>✓ eventSQL: SELECT...]
        PLAN_FORM[plansForm Override<br/>✓ props: {formFields}<br/>✓ eventSQL: SELECT...]
    end

    NAV -.used as-is.-> PAGE1[Brands Page]
    NAV -.used as-is.-> PAGE2[Plans Page]

    GRID -.requires.-> BRAND_GRID
    BRAND_GRID --> PAGE1

    FORM -.requires.-> PLAN_FORM
    PLAN_FORM --> PAGE2

    style Reusable fill:#e1f5ff
    style Templates fill:#fff4e1
    style PageOverrides fill:#ffe1e1
```

## Key Takeaways

1. **Relative Positioning**: All positions are relative to their immediate container
2. **Two-Level System**: Composite templates + page overrides
3. **sp_pageStructure Does Heavy Lifting**: Merges, transforms, structures data
4. **PageRenderer Simplified**: Receives ready-to-render hierarchical JSON
5. **Composites Are Containers**: Each maintains its own coordinate grid

---

_These diagrams support Plan 75: Composite Architecture Infrastructure_
