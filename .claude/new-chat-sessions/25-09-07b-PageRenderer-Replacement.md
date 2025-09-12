PageRenderer Replacement Strategy

  Session Date: 2025-09-07Focus: Complete PageRenderer rewrite with generic, workflow-driven architecturePrevious Context: WorkflowEngine modularization completed, legacy PageRenderer
   analysis complete

  🎯 Replacement Strategy Overview

  Current Problem

  - Legacy contamination: planManager → Studio evolution left hardcoded business logic
  - Non-generic approach: Hardcoded eventTypeHierarchy, Studio-specific handlers
  - Violation of separation: PageRenderer contains business logic that belongs in workflows
  - Maintenance nightmare: Too much app-specific code in what should be generic renderer

  Solution: Clean Slate Rewrite

  Complete replacement with truly generic, workflow-driven PageRenderer that only processes pageConfig structure.

  🏗️ Implementation Phases

  Phase 1: Minimal Viable PageRenderer

  const PageRenderer = ({ config }) => {
    const contextStore = useContextStore();

    useEffect(() => {
      workflowEngine.initialize(contextStore);
    }, [contextStore]);

    return <LayoutRenderer config={config} />;
  };

  const LayoutRenderer = ({ config }) => {
    return (
      <div style={getLayoutStyles(config.layout)}>
        {config.components.map(component => (
          <ComponentRenderer key={component.id} component={component} />
        ))}
      </div>
    );
  };

  Phase 2: Event-Driven Component System

  const ComponentRenderer = ({ component }) => {
    // Execute component onLoad when it mounts
    useEffect(() => {
      workflowEngine.executeTrigger(component, 'onLoad', {});
    }, [component]);

    // Handle user interactions through workflow triggers
    const handleChange = (data) => {
      workflowEngine.executeTrigger(component, 'onChange', data);
    };

    const handleSelect = (data) => {
      workflowEngine.executeTrigger(component, 'onSelect', data);
    };

    return <GenericComponent
      component={component}
      onChange={handleChange}
      onSelect={handleSelect}
    />;
  };

  Phase 3: Dynamic Component Resolution

  // Convention-based approach - eliminate hardcoded registries
  const GenericComponent = ({ component, ...handlers }) => {
    const { type, props = {}, components = [] } = component;

    switch(type) {
      case 'sidebar': return <GenericSidebar component={component} {...handlers} />;
      case 'column': return <GenericColumn component={component} {...handlers} />;
      case 'tabs': return <GenericTabs component={component} {...handlers} />;
      case 'select': return <GenericSelect component={component} {...handlers} />;
      default: return <GenericFallback component={component} {...handlers} />;
    }
  };

  Phase 4: Truly Generic Components

  Each component becomes a pure renderer with workflow-driven interactions:

  const GenericSelect = ({ component, onChange }) => {
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState('');

    return (
      <div style={component.props?.style}>
        <label>{component.props?.title}</label>
        <select
          value={selected}
          onChange={(e) => onChange({value: e.target.value, component})}
        >
          {data.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>
    );
  };

  🔧 File Structure

  Replacement Approach

  # Preserve legacy for reference
  mv src/rendering/PageRenderer/index.jsx src/rendering/PageRenderer/index-legacy.jsx

  # Create clean slate
  touch src/rendering/PageRenderer/index.jsx
  touch src/rendering/PageRenderer/LayoutRenderer.jsx
  touch src/rendering/PageRenderer/ComponentRenderer.jsx
  touch src/rendering/PageRenderer/components/GenericSidebar.jsx
  touch src/rendering/PageRenderer/components/GenericColumn.jsx
  # ... etc

  📋 Key Principles

  1. Zero Hardcoded Business Logic

  - No eventTypeHierarchy objects
  - No handleAppChange, handleGeneratePageConfig functions
  - No Studio/planManager-specific code

  2. Pure pageConfig Processing

  - PageRenderer only reads and renders pageConfig structure
  - All business logic handled through workflow triggers
  - Components self-manage through WorkflowEngine calls

  3. Event-Driven Architecture

  - onLoad → when component mounts (useEffect)
  - onChange → when user changes values (event handlers)
  - onSelect → when user selects items (event handlers)
  - WorkflowEngine handles existence checks and execution

  4. Component Self-Management

  - Each component calls workflowEngine.executeTrigger for its own events
  - No parent components managing child workflows
  - Clean separation of concerns

  🎯 Success Criteria

  Functional Requirements

  - ✅ Renders existing Studio pageConfig without modification
  - ✅ Handles all component interactions through workflows
  - ✅ Supports selectApp → selectPage → accordion → cards flow
  - ✅ Works with modular WorkflowEngine methods

  Non-Functional Requirements

  - ✅ Zero app-specific hardcoded logic
  - ✅ Reusable across any app's pageConfig
  - ✅ Maintainable and extensible
  - ✅ Clear separation from genPageConfig concerns

  🚀 Testing Strategy

  1. Start in Studio context - use existing pageConfig.json as test case
  2. Verify workflow execution - ensure onLoad/onChange triggers work
  3. Test component coordination - selectApp should refresh selectPage
  4. Validate genericness - should handle any properly structured pageConfig

  💡 Next Session Focus

  - Working directory: /apps/wf-studio (not monorepo root)
  - Primary tasks:
    a. Implement Phase 1 minimal PageRenderer
    b. Test with existing pageConfig.json
    c. Iteratively add component types as needed
  - Secondary: Review genPageConfig output alignment with new PageRenderer expectations

  ---Ready for clean slate implementation with truly generic, workflow-driven architecture.