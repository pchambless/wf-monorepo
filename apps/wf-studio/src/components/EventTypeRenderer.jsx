import React from 'react';

/**
 * EventTypeRenderer - Core component that builds UI from eventType definitions
 * This is the heart of Studio's self-hosting capability
 * Enhanced to use template + card system
 */
const EventTypeRenderer = ({ eventType, eventTypeData, onUpdate }) => {
  const [activeTab, setActiveTab] = React.useState(null);
  const [previewData, setPreviewData] = React.useState(null);
  const [template, setTemplate] = React.useState(null);
  const [loadedCards, setLoadedCards] = React.useState({});

  // Load template based on eventTypeData category
  React.useEffect(() => {
    const loadTemplate = async () => {
      if (!eventTypeData?.category) return;
      
      try {
        // Determine template based on category
        let templateModule;
        switch (eventTypeData.category) {
          case 'form':
            templateModule = await import('../eventTypes/templates/leafs/form.js');
            setTemplate(templateModule.formTemplate);
            break;
          case 'grid':
            templateModule = await import('../eventTypes/templates/leafs/grid.js');
            setTemplate(templateModule.gridTemplate);
            break;
          case 'tabs':
          case 'tab':
            templateModule = await import('../eventTypes/templates/containers/tabs.js');
            setTemplate(templateModule.tabsTemplate);
            break;
          default:
            console.warn(`No template found for category: ${eventTypeData.category}`);
            setTemplate(null);
        }
      } catch (error) {
        console.error('Failed to load template:', error);
        setTemplate(null);
      }
    };

    loadTemplate();
  }, [eventTypeData?.category]);

  // Load cards based on template
  React.useEffect(() => {
    const loadCards = async () => {
      if (!template?.detailCards) return;
      
      const cards = {};
      
      for (const cardName of template.detailCards) {
        try {
          const cardModule = await import(`../eventTypes/studio/pages/Studio/cards/${cardName}.js`);
          cards[cardName] = cardModule[cardName];
        } catch (error) {
          console.error(`Failed to load card ${cardName}:`, error);
        }
      }
      
      setLoadedCards(cards);
    };

    loadCards();
  }, [template]);

  React.useEffect(() => {
    // Set default tab from eventType definition
    if (eventType?.components?.[0]?.props?.defaultTab) {
      setActiveTab(eventType.components[0].props.defaultTab);
    }
  }, [eventType]);

  if (!eventType) {
    return (
      <div className="event-type-renderer-error">
        <h4>No EventType Definition</h4>
        <p>No eventType provided to render</p>
      </div>
    );
  }

  // Render based on template + card system
  const renderComponents = () => {
    // If we have template and cards loaded, render cards
    if (template && Object.keys(loadedCards).length > 0) {
      return renderTemplateCards();
    }
    
    // Fallback to legacy eventType structure
    return eventType.components?.map(component => {
      switch (component.type) {
        case 'tabs':
          return renderTabs(component);
        default:
          return (
            <div key={component.id} className="unknown-component">
              Unknown component type: {component.type}
            </div>
          );
      }
    });
  };

  // Render cards from template
  const renderTemplateCards = () => {
    return (
      <div className="template-cards-container">
        <div className="template-cards-grid">
          {template.detailCards.map(cardName => {
            const card = loadedCards[cardName];
            if (!card) return null;
            
            return (
              <div key={cardName} className="template-card">
                {renderCard(card)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render individual card
  const renderCard = (card) => {
    return (
      <div className="property-card">
        <div className="card-header">
          <span className="card-icon">🔵</span>
          <h3 className="card-title">{card.title}</h3>
        </div>
        
        <div className="card-content">
          {card.fields && card.fields.map(field => (
            <div key={field.name} className="property-field">
              <label className="property-label">
                {field.label}
                {field.hint && <span className="property-hint-inline">({field.hint})</span>}
              </label>
              {renderFormField(field)}
            </div>
          ))}
          
          {card.actions && (
            <div className="card-actions">
              {card.actions.map(action => (
                <button
                  key={action.action}
                  className={`action-button ${action.type}`}
                  onClick={() => handleCardAction(action)}
                  disabled={action.disabled}
                  title={action.tooltip}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render form field based on type
  const renderFormField = (field) => {
    const value = eventTypeData?.[field.name] || '';
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onUpdate?.({ ...eventTypeData, [field.name]: e.target.value })}
            className="property-input"
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            <option value="form">Form</option>
            <option value="grid">Grid</option>
            <option value="page">Page</option>
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onUpdate?.({ ...eventTypeData, [field.name]: e.target.value })}
            className="property-input"
            placeholder={field.placeholder}
            rows="3"
          />
        );
      default:
        return (
          <input
            type={field.type || 'text'}
            value={value}
            onChange={(e) => onUpdate?.({ ...eventTypeData, [field.name]: e.target.value })}
            className="property-input"
            placeholder={field.placeholder}
            readOnly={field.readonly}
          />
        );
    }
  };

  // Handle card actions
  const handleCardAction = async (action) => {
    switch (action.action) {
      case 'generateFields':
        await handleGenerateFields();
        break;
      case 'saveChanges':
        console.log('💾 Save changes action');
        break;
      default:
        console.log(`Unknown action: ${action.action}`);
    }
  };

  // Render tabbed interface
  const renderTabs = (tabsComponent) => {
    const tabs = tabsComponent.tabs || [];
    
    return (
      <div key={tabsComponent.id} className="event-type-tabs">
        {/* Tab Headers */}
        <div className="tab-headers">
          {tabs.map(tab => {
            // Check conditional visibility
            if (tab.conditional && !evaluateCondition(tab.conditional)) {
              return null;
            }
            
            return (
              <button
                key={tab.id}
                className={`tab-header ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {tabs.map(tab => {
            if (activeTab !== tab.id) return null;
            if (tab.conditional && !evaluateCondition(tab.conditional)) return null;
            
            return (
              <div key={tab.id} className="tab-pane">
                {renderTabContent(tab)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render individual tab content
  const renderTabContent = (tab) => {
    switch (tab.id) {
      case 'properties':
        return renderPropertiesTab();
      case 'fields':
        return <FieldsTab 
          eventType={eventType}
          eventTypeData={eventTypeData}
          onUpdate={onUpdate}
          onPreviewGenerated={setPreviewData}
        />;
      case 'preview':
        return <PreviewTab
          eventType={eventType}
          eventTypeData={eventTypeData}
          previewData={previewData}
          onApply={handleApplyPreview}
          onCancel={handleCancelPreview}
        />;
      default:
        return (
          <div className="unknown-tab">
            <h4>Unknown Tab: {tab.id}</h4>
            <p>Component: {tab.component}</p>
          </div>
        );
    }
  };

  // Render Properties Tab with card-based layout
  const renderPropertiesTab = () => {
    const propertiesConfig = eventType.propertiesTab;
    
    if (!propertiesConfig || propertiesConfig.layout !== 'cards') {
      return <div>Properties configuration not found</div>;
    }

    return (
      <div className="properties-cards-container">
        <div className="properties-cards-grid">
          {propertiesConfig.cards?.map(card => renderCard(card))}
        </div>
      </div>
    );
  };

  // Render individual card
  const renderCard = (card) => {
    const cardClass = `property-card ${card.fullWidth ? 'full-width' : ''}`;
    
    return (
      <div key={card.id} className={cardClass}>
        <div className={`card-header ${card.color}`}>
          <span className="card-icon">{card.icon}</span>
          <h3 className="card-title">{card.title}</h3>
        </div>
        
        <div className="card-content">
          {/* Render basic fields if they exist */}
          {card.fields && renderCardFields(card.fields)}
          
          {/* Render sections if they exist */}
          {card.sections && card.sections.map(section => renderCardSection(section))}
          
          {/* Render card actions if they exist */}
          {card.actions && renderCardActions(card.actions)}
        </div>
      </div>
    );
  };

  // Render card fields
  const renderCardFields = (fields) => {
    return fields.map(field => (
      <div key={field.name} className="property-field">
        <label className="property-label">
          {field.label} 
          {field.hint && <span className="property-hint-inline">({field.hint})</span>}
        </label>
        {renderFormField(field)}
      </div>
    ));
  };

  // Render form field based on type
  const renderFormField = (field) => {
    const value = eventTypeData?.[field.name] || '';
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onUpdate?.({ ...eventTypeData, [field.name]: e.target.value })}
            className="property-input"
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            {/* TODO: Load options from field.options */}
            <option value="form">Form</option>
            <option value="grid">Grid</option>
            <option value="page">Page</option>
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onUpdate?.({ ...eventTypeData, [field.name]: e.target.value })}
            className="property-input"
            placeholder={field.placeholder}
            rows="3"
          />
        );
      default:
        return (
          <input
            type={field.type || 'text'}
            value={value}
            onChange={(e) => onUpdate?.({ ...eventTypeData, [field.name]: e.target.value })}
            className="property-input"
            placeholder={field.placeholder}
            readOnly={field.readonly}
          />
        );
    }
  };

  // Render card section
  const renderCardSection = (section) => {
    return (
      <div key={section.id} className="card-section">
        <h4 className="section-title">{section.title}</h4>
        {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
        
        {section.fields && renderCardFields(section.fields)}
        {section.component === 'FieldsList' && renderFieldsList()}
        {section.component === 'FieldOverridesList' && renderFieldOverridesList()}
      </div>
    );
  };

  // Render fields list (AUTO-GENERATED ZONE)
  const renderFieldsList = () => {
    const fields = eventTypeData?.fields || [];
    
    if (fields.length === 0) {
      return <p className="empty-state">No fields generated yet. Click "Generate Fields" to create them.</p>;
    }

    return (
      <div className="fields-list">
        {fields.map(field => (
          <div key={field.name} className="field-item">
            <span className="field-name">{field.name}</span>
            <span className="field-type">({field.type})</span>
            {field.grp && <span className="field-grp">Group {field.grp}</span>}
            {field.width && <span className="field-width">Width {field.width}</span>}
          </div>
        ))}
      </div>
    );
  };

  // Render field overrides list (MANUAL CUSTOMIZATION ZONE)
  const renderFieldOverridesList = () => {
    const overrides = eventTypeData?.fieldOverrides || {};
    
    if (Object.keys(overrides).length === 0) {
      return <p className="empty-state">No manual customizations yet.</p>;
    }

    return (
      <div className="field-overrides-list">
        {Object.entries(overrides).map(([fieldName, override]) => (
          <div key={fieldName} className="override-item">
            <span className="override-field">{fieldName}:</span>
            <span className="override-values">{JSON.stringify(override)}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render card actions
  const renderCardActions = (actions) => {
    return (
      <div className="card-actions">
        {actions.map(action => (
          <button
            key={action.action}
            className={`action-button ${action.type}`}
            onClick={() => handleCardAction(action)}
            disabled={action.disabled && evaluateCondition(action.disabled)}
            title={action.tooltip}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  // Handle card actions
  const handleCardAction = async (action) => {
    switch (action.action) {
      case 'generateFields':
        await handleGenerateFields();
        break;
      case 'saveChanges':
        console.log('💾 Save changes action');
        // TODO: Implement save functionality
        break;
      default:
        console.log(`Unknown action: ${action.action}`);
    }
  };

  // Generate fields action (moved from FieldsTab)
  const handleGenerateFields = async () => {
    if (!eventTypeData?.qry) {
      alert('EventType missing qry property - cannot generate fields');
      return;
    }

    try {
      // Import and use the unified workflow
      const { unifiedGenFieldsWorkflow } = await import('../workflows/unifiedGenFields.js');
      
      // Generate preview data instead of directly updating
      const result = await unifiedGenFieldsWorkflow.startGenFieldsProcess(eventTypeData);
      
      // Pass preview to parent
      setPreviewData(result);
      
      // Switch to preview tab
      setActiveTab('preview');
      
      console.log('✅ Preview data generated for properties tab');
    } catch (error) {
      console.error('❌ Field generation failed:', error);
      alert(`Field generation failed: ${error.message}`);
    }
  };

  // Evaluate conditional visibility
  const evaluateCondition = (condition) => {
    switch (condition) {
      case 'hasPreviewData':
        return previewData !== null;
      case 'hasExistingFields':
        return eventTypeData?.fields?.length > 0;
      case 'hasFieldOverrides':
        return eventTypeData?.fieldOverrides && Object.keys(eventTypeData.fieldOverrides).length > 0;
      default:
        return true;
    }
  };

  // Handle preview actions
  const handleApplyPreview = () => {
    if (previewData && onUpdate) {
      onUpdate(previewData.eventType);
      setPreviewData(null);
      setActiveTab('fields'); // Go back to fields tab
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setActiveTab('fields'); // Go back to fields tab
  };

  return (
    <div className="event-type-renderer">
      <div className="renderer-header">
        <h4>{eventType.title}</h4>
        <p className="renderer-purpose">{eventType.purpose}</p>
      </div>
      <div className="renderer-content">
        {renderComponents()}
      </div>
    </div>
  );
};

// Stub components - will be replaced with real implementations
const PropertiesTab = ({ eventType, eventTypeData, onUpdate }) => {
  return (
    <div className="properties-tab">
      <h5>Properties Tab</h5>
      <p>EventType: {eventTypeData?.title || 'No title'}</p>
      <p>Category: {eventTypeData?.category || 'No category'}</p>
      <p>Query: {eventTypeData?.qry || 'No query'}</p>
      <p><em>Full properties form will be implemented here</em></p>
    </div>
  );
};

const FieldsTab = ({ eventType, eventTypeData, onUpdate, onPreviewGenerated }) => {
  const handleGenerateFields = async () => {
    try {
      // Import and use the unified workflow
      const { unifiedGenFieldsWorkflow } = await import('../workflows/unifiedGenFields.js');
      
      // Generate preview data instead of directly updating
      const result = await unifiedGenFieldsWorkflow.startGenFieldsProcess(eventTypeData);
      
      // Pass preview to parent
      onPreviewGenerated(result);
      
      console.log('✅ Preview data generated for fields tab');
    } catch (error) {
      console.error('❌ Field generation failed:', error);
      alert(`Field generation failed: ${error.message}`);
    }
  };

  return (
    <div className="fields-tab">
      <h5>Fields Tab</h5>
      
      {eventTypeData?.fields?.length > 0 && (
        <div className="current-fields">
          <h6>Current Fields ({eventTypeData.fields.length})</h6>
          <ul>
            {eventTypeData.fields.map(field => (
              <li key={field.name}>
                {field.label} ({field.type}) - Group {field.grp}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="field-generation">
        <h6>Field Generation</h6>
        <button
          onClick={handleGenerateFields}
          disabled={!eventTypeData?.qry}
          className="generate-fields-btn"
        >
          🔄 Generate Fields
        </button>
        {!eventTypeData?.qry && (
          <p className="hint">Add a 'qry' property to enable field generation</p>
        )}
      </div>
    </div>
  );
};

const PreviewTab = ({ eventType, eventTypeData, previewData, onApply, onCancel }) => {
  if (!previewData) {
    return (
      <div className="preview-tab">
        <p>No preview data available</p>
      </div>
    );
  }

  return (
    <div className="preview-tab">
      <h5>Preview Changes</h5>
      
      <div className="preview-split">
        <div className="preview-current">
          <h6>Current</h6>
          <pre>{JSON.stringify(eventTypeData, null, 2)}</pre>
        </div>
        
        <div className="preview-generated">
          <h6>Generated</h6>
          <pre>{JSON.stringify(previewData.eventType, null, 2)}</pre>
        </div>
      </div>
      
      <div className="preview-actions">
        <button onClick={onApply} className="apply-btn">
          Apply Changes
        </button>
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
      
      {previewData.notification && (
        <div className="preview-stats">
          <p><strong>{previewData.notification.title}</strong></p>
          <p>{previewData.notification.message}</p>
        </div>
      )}
    </div>
  );
};

export default EventTypeRenderer;