/**
 * PageRenderer - Transforms eventType metadata into React UI components
 * Takes declarative component structure and renders actual React components
 */

import React, { useState, useEffect } from 'react';
import { FormComponent } from '@whatsfresh/shared-imports/jsx';
import '../styles/components/PageLayout.css';
import '../styles/components/TabsContainer.css';
import '../styles/components/GridComponent.css';
import '../styles/components/FormComponent.css';
import '../styles/components/TabComponent.css';
import '../styles/components/GenericRenderer.css';

const PageRenderer = ({ eventType, data, onRowClick, onSelectionChange }) => {
  // Handle different eventType categories
  switch (eventType.category) {
    case 'page':
      return <PageLayout eventType={eventType} data={data} onRowClick={onRowClick} onSelectionChange={onSelectionChange} />;
    case 'tabs':
      return <TabsContainer eventType={eventType} data={data} onRowClick={onRowClick} onSelectionChange={onSelectionChange} />;
    case 'grid':
      return <GridComponent eventType={eventType} data={data} onRowClick={onRowClick} onSelectionChange={onSelectionChange} />;
    case 'form':
      return <SchemaDrivenFormComponent eventType={eventType} data={data} onRowClick={onRowClick} onSelectionChange={onSelectionChange} />;
    case 'tab':
      return <TabComponent eventType={eventType} data={data} onRowClick={onRowClick} onSelectionChange={onSelectionChange} />;
    case 'select':
      return <SelectComponent eventType={eventType} data={data} onRowClick={onRowClick} onSelectionChange={onSelectionChange} />;
    default:
      return <GenericRenderer eventType={eventType} data={data} onRowClick={onRowClick} onSelectionChange={onSelectionChange} />;
  }
};

// Schema-driven form component wrapper
const SchemaDrivenFormComponent = ({ eventType, data, onRowClick, onSelectionChange }) => {
  const [schema, setSchema] = useState(null);
  const [displayConfig, setDisplayConfig] = useState(null);
  const [lookupData, setLookupData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFormConfiguration = async () => {
      try {
        setLoading(true);
        
        // Determine entity from eventType name (formPlan -> plans)
        const entityName = eventType.eventType ? 
          eventType.eventType.replace('form', '').toLowerCase() + 's' :
          eventType.name?.replace('form', '').toLowerCase() + 's';

        console.log('🔧 Loading form configuration for entity:', entityName);

        // Load schema
        let schemaData = null;
        try {
          // In a real implementation, you'd load this via API or import
          if (entityName === 'plans') {
            schemaData = await loadPlansSchema();
          }
        } catch (error) {
          console.warn('Could not load schema for', entityName, error);
        }

        // Load display configuration
        let displayData = null;
        try {
          if (eventType.displayConfig) {
            displayData = await loadDisplayConfig(eventType.displayConfig);
          } else {
            displayData = generateDefaultDisplayConfig(entityName, schemaData);
          }
        } catch (error) {
          console.warn('Could not load display config:', error);
          displayData = generateDefaultDisplayConfig(entityName, schemaData);
        }

        // Load lookup data for foreign keys
        const lookups = {};
        if (schemaData?.fields) {
          for (const field of schemaData.fields) {
            if (field.foreignKey) {
              try {
                const lookupOptions = await loadLookupData(field.foreignKey.mapping);
                lookups[field.foreignKey.mapping] = lookupOptions;
              } catch (error) {
                console.warn(`Could not load lookup data for ${field.foreignKey.mapping}:`, error);
                lookups[field.foreignKey.mapping] = [];
              }
            }
          }
        }

        setSchema(schemaData);
        setDisplayConfig(displayData);
        setLookupData(lookups);

      } catch (error) {
        console.error('Failed to load form configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormConfiguration();
  }, [eventType]);

  const handleSave = async (formData) => {
    console.log('💾 Form save requested:', formData);
    
    // Trigger form save workflow
    if (eventType.workflowTriggers?.onCreate || eventType.workflowTriggers?.onUpdate) {
      const isUpdate = formData.id;
      const triggerKey = isUpdate ? 'onUpdate' : 'onCreate';
      const triggers = eventType.workflowTriggers[triggerKey];
      
      if (triggers) {
        console.log(`🔄 Executing ${triggerKey} workflow:`, triggers);
        // This would integrate with your WorkflowEngine
        // await workflowEngine.executeTrigger(eventType, triggerKey, formData);
      }
    }
  };

  const handleCancel = () => {
    console.log('❌ Form cancelled');
    // Trigger cancel workflow if defined
    if (eventType.workflowTriggers?.onCancel) {
      console.log('🔄 Executing onCancel workflow:', eventType.workflowTriggers.onCancel);
    }
  };

  if (loading) {
    return (
      <div className="form-loading p-4 border border-gray-300 rounded">
        <h4>{eventType.title}</h4>
        <p>Loading form configuration...</p>
      </div>
    );
  }

  if (!schema || !displayConfig) {
    return (
      <div className="form-error p-4 border border-red-300 rounded">
        <h4>{eventType.title}</h4>
        <p>Could not load form configuration</p>
        <details>
          <summary>Debug Info</summary>
          <pre>{JSON.stringify({ 
            eventType: eventType.eventType || eventType.name, 
            schema: !!schema, 
            displayConfig: !!displayConfig 
          }, null, 2)}</pre>
        </details>
      </div>
    );
  }

  // Determine form mode
  const mode = data && data.id ? 'edit' : 'create';

  return (
    <FormComponent
      schema={schema}
      displayConfig={displayConfig}
      formConfig={{
        validation: eventType.validation || {},
        workflowTriggers: eventType.workflowTriggers || {}
      }}
      initialData={data || {}}
      mode={mode}
      onSave={handleSave}
      onCancel={handleCancel}
      lookupData={lookupData}
    />
  );
};

// Helper functions for loading configurations
const loadPlansSchema = async () => {
  // In a real implementation, this would fetch from API or import the file
  // For now, return a mock schema based on what we know
  return {
    fields: [
      {
        name: "id",
        type: "INT UNSIGNED",
        nullable: false,
        uiType: "number",
        validationRules: ["required", "type:number"],
        inputProps: {},
        primaryKey: true
      },
      {
        name: "cluster",
        type: "VARCHAR(20)",
        nullable: false,
        uiType: "text",
        validationRules: ["required", "maxLength:20", "type:text"],
        inputProps: { maxLength: 20 },
        foreignKey: {
          type: "selectVals",
          mapping: "cluster",
          widget: "selCluster",
          uiType: "select"
        }
      },
      {
        name: "name",
        type: "VARCHAR(255)",
        nullable: false,
        uiType: "text",
        validationRules: ["required", "maxLength:255", "type:text"],
        inputProps: { maxLength: 255 }
      },
      {
        name: "status",
        type: "VARCHAR(100)",
        nullable: false,
        default: "pending",
        uiType: "text",
        validationRules: ["required", "maxLength:100", "type:text"],
        inputProps: { maxLength: 100, defaultValue: "pending" },
        foreignKey: {
          type: "selectVals",
          mapping: "planStatus",
          widget: "selStatus",
          uiType: "select"
        }
      },
      {
        name: "priority",
        type: "VARCHAR(20)",
        nullable: false,
        default: "medium",
        uiType: "text",
        validationRules: ["required", "maxLength:20", "type:text"],
        inputProps: { maxLength: 20, defaultValue: "medium" },
        foreignKey: {
          type: "selectVals",
          mapping: "priority",
          widget: "selPriority",
          uiType: "select"
        }
      },
      {
        name: "description",
        type: "TEXT",
        nullable: true,
        uiType: "text",
        validationRules: ["type:text"],
        inputProps: {}
      },
      {
        name: "comments",
        type: "TEXT",
        nullable: true,
        uiType: "text",
        validationRules: ["type:text"],
        inputProps: {}
      },
      {
        name: "assigned_to",
        type: "VARCHAR(50)",
        nullable: true,
        uiType: "text",
        validationRules: ["maxLength:50", "type:text"],
        inputProps: { maxLength: 50 }
      },
      {
        name: "created_at",
        type: "TIMESTAMP",
        nullable: true,
        default: "now()",
        uiType: "datetime",
        validationRules: ["type:datetime"],
        inputProps: { defaultValue: "now()" }
      },
      {
        name: "created_by",
        type: "VARCHAR(50)",
        nullable: false,
        uiType: "text",
        validationRules: ["required", "maxLength:50", "type:text"],
        inputProps: { maxLength: 50 }
      }
    ]
  };
};

const loadDisplayConfig = async (configPath) => {
  // In a real implementation, this would import or fetch the display config
  return generateDefaultDisplayConfig('plans');
};

const generateDefaultDisplayConfig = (entityName, schema) => {
  const fields = schema?.fields || [];
  
  return {
    entityName: entityName,
    tableName: `api_wf.${entityName}`,
    primaryKey: 'id',
    form: {
      sections: [
        {
          title: 'Basic Information',
          fields: fields
            .filter(field => !['deleted_at', 'deleted_by', 'updated_at', 'updated_by', 'active'].includes(field.name))
            .map(field => ({
              name: field.name,
              label: field.name.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
              type: field.uiType || 'text',
              required: field.validationRules?.includes('required') || false
            }))
        }
      ]
    },
    actions: {
      create: { enabled: true, label: 'Create' },
      edit: { enabled: true, label: 'Edit' },
      view: { enabled: true, label: 'View' }
    }
  };
};

const loadLookupData = async (mappingKey) => {
  // Mock lookup data - in real implementation, fetch from API
  const mockLookups = {
    cluster: [
      { value: 'DEVELOPMENT', label: 'Development' },
      { value: 'PRODUCTION', label: 'Production' },
      { value: 'TESTING', label: 'Testing' }
    ],
    planStatus: [
      { value: 'pending', label: 'Pending' },
      { value: 'active', label: 'Active' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ],
    priority: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' }
    ]
  };

  return mockLookups[mappingKey] || [];
};

// Rest of the existing PageRenderer components...

const PageLayout = ({ eventType, data, onRowClick }) => {
  if (!eventType.components || !Array.isArray(eventType.components)) {
    return <div className="page-layout">{eventType.title}</div>;
  }

  return (
    <div className="page-layout">
      <h1>{eventType.title}</h1>
      <div className="page-components">
        {eventType.components.map((component, index) => (
          <ComponentRenderer
            key={component.id || index}
            component={component}
            data={data}
            onRowClick={onRowClick}
          />
        ))}
      </div>
    </div>
  );
};

const ComponentRenderer = ({ component, data, onRowClick }) => {
  const containerStyle = {
    gridColumn: `${component.position?.col || 1} / span ${component.span?.cols || 1}`,
    gridRow: `${component.position?.row || 1} / span ${component.span?.rows || 1}`,
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    marginBottom: '10px'
  };

  switch (component.container) {
    case 'tabs':
      return (
        <div style={containerStyle}>
          <TabsContainer 
            eventType={{ ...component, title: component.props?.title }}
            data={data}
            onRowClick={onRowClick}
          />
        </div>
      );
    case 'grid':
      return (
        <div style={containerStyle}>
          <GridComponent 
            eventType={{ ...component, title: component.props?.title }}
            data={data}
            onRowClick={onRowClick}
          />
        </div>
      );
    case 'form':
      return (
        <div style={containerStyle}>
          <SchemaDrivenFormComponent 
            eventType={{ ...component, title: component.props?.title }}
            data={data}
            onRowClick={onRowClick}
          />
        </div>
      );
    default:
      return (
        <div style={containerStyle}>
          <div className="component-placeholder">
            <h4>{component.props?.title || component.id}</h4>
            <p>Container: {component.container}</p>
          </div>
        </div>
      );
  }
};

const TabsContainer = ({ eventType, data, onRowClick }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h3>{eventType.title}</h3>
      </div>
      <div className="tabs-content">
        <p>Tabs functionality will be implemented here</p>
        <p>This would connect to tab eventTypes like tabPlan, tabPlanComms, etc.</p>
      </div>
    </div>
  );
};

const GridComponent = ({ eventType, data, onRowClick }) => {
  const hasData = Array.isArray(data) && data.length > 0;
  
  return (
    <div className="grid-component">
      <h4>{eventType.title}</h4>
      {hasData ? (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((row, index) => (
              <tr 
                key={index} 
                onClick={() => onRowClick && onRowClick(row)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="border border-gray-300 px-4 py-2">
                  {JSON.stringify(row).substring(0, 80)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data p-4 text-gray-500 text-center border border-gray-300 rounded">
          No data available for {eventType.eventType || eventType.name || 'this grid'}
        </div>
      )}
    </div>
  );
};

const TabComponent = ({ eventType, data, onRowClick }) => {
  return (
    <div className="tab-component">
      <h4>{eventType.title}</h4>
      <div className="tab-content">
        <p>Tab content for {eventType.eventType || eventType.name}</p>
        {eventType.components && eventType.components.length > 0 && (
          <div className="tab-child-components">
            <h5>Child Components:</h5>
            <ul>
              {eventType.components.map((comp, index) => (
                <li key={index}>{comp.id} ({comp.container})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const SelectComponent = ({ eventType, data, onRowClick, onSelectionChange }) => {
  console.log(`🔍 SelectComponent rendering for ${eventType.eventType || eventType.name}:`, data);
  
  const choices = data?.data || data;
  
  const handleSelectionChange = (event) => {
    const selectedValue = event.target.value;
    console.log(`🔄 Selection changed in ${eventType.name || eventType.eventType}:`, selectedValue);
    
    if (eventType.workflowTriggers?.onSelectionChange && onSelectionChange) {
      onSelectionChange(selectedValue);
    }
  };

  const hasChoices = Array.isArray(choices) && choices.length > 0;
  
  return (
    <div className="select-component" style={{ 
      backgroundColor: '#e3f2fd', 
      border: '2px solid #2196f3', 
      padding: '15px', 
      margin: '10px 0',
      borderRadius: '8px'
    }}>
      <h4 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>🔽 {eventType.title}</h4>
      <select onChange={handleSelectionChange} style={{ 
        padding: '8px 12px', 
        borderRadius: '4px', 
        border: '1px solid #ccc',
        fontSize: '14px',
        minWidth: '200px'
      }}>
        <option value="">-- Select {eventType.title} --</option>
        {hasChoices && choices.map((choice, index) => (
          <option key={choice.id || choice.value || index} value={choice.id || choice.value || choice}>
            {choice.label || choice}
          </option>
        ))}
      </select>
      {!hasChoices && (
        <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
          No options available
        </div>
      )}
    </div>
  );
};

const GenericRenderer = ({ eventType, data, onRowClick }) => {
  return (
    <div className="generic-renderer p-4 border border-gray-300 rounded">
      <h4 className="font-semibold">{eventType.title}</h4>
      <p><strong>Category:</strong> {eventType.category}</p>
      <p><strong>EventType:</strong> {eventType.eventType || eventType.name}</p>
      {data && (
        <div>
          <strong>Data:</strong> 
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
            {typeof data === 'object' ? JSON.stringify(data, null, 2).substring(0, 200) + '...' : String(data)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PageRenderer;