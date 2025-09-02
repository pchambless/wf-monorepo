/**
 * LeafRenderer - Handles leaf eventTypes
 * 
 * Renders forms, grids, cards with fields and actions
 * Manages field layout and data binding
 */

import React from 'react';
import FieldRenderer from './FieldRenderer';
import LayoutEngine from './LayoutEngine';
import ActionHandler from './ActionHandler';

const LeafRenderer = ({ eventType, componentKey }) => {
  
  /**
   * Render leaf based on category
   */
  const renderLeafByCategory = () => {
    switch (eventType.category) {
      case 'form':
        return renderForm();
      case 'grid':
        return renderGrid();
      case 'card':
        return renderCard();
      default:
        return renderGenericLeaf();
    }
  };

  /**
   * Render form leaf
   */
  const renderForm = () => (
    <form className="form-leaf">
      <div className="form-header">
        <h4 className="form-title">{eventType.title}</h4>
        {eventType.purpose && <span className="form-purpose">{eventType.purpose}</span>}
      </div>

      <div className="form-body">
        {renderFields()}
      </div>

      <div className="form-actions">
        {renderActions()}
      </div>

      {renderDebugInfo()}
    </form>
  );

  /**
   * Render grid leaf (for now, just show structure - actual grid would need data)
   */
  const renderGrid = () => (
    <div className="grid-leaf">
      <div className="grid-header">
        <h4 className="grid-title">{eventType.title}</h4>
        {eventType.purpose && <span className="grid-purpose">{eventType.purpose}</span>}
      </div>

      <div className="grid-toolbar">
        {renderActions()}
      </div>

      <div className="grid-body">
        {eventType.fields ? (
          <div className="grid-placeholder">
            <p>Grid with {eventType.fields.length} columns</p>
            <div className="grid-columns">
              {eventType.fields.map(field => (
                <span key={field.name} className="column-name">
                  {field.label || field.name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p>No fields defined for grid</p>
        )}
      </div>

      {renderDebugInfo()}
    </div>
  );

  /**
   * Render card leaf
   */
  const renderCard = () => (
    <div className="card-leaf">
      <div className="card-header">
        <h4 className="card-title">{eventType.title}</h4>
        {eventType.purpose && <span className="card-purpose">{eventType.purpose}</span>}
      </div>

      <div className="card-body">
        {renderFields()}
      </div>

      <div className="card-actions">
        {renderActions()}
      </div>

      {renderDebugInfo()}
    </div>
  );

  /**
   * Render generic leaf for unknown categories
   */
  const renderGenericLeaf = () => (
    <div className={`leaf-${eventType.category}`}>
      <div className="leaf-header">
        <h4>{eventType.title}</h4>
        {eventType.purpose && <span className="purpose">{eventType.purpose}</span>}
      </div>

      <div className="leaf-body">
        {renderFields()}
      </div>

      <div className="leaf-actions">
        {renderActions()}
      </div>

      {renderDebugInfo()}
    </div>
  );

  /**
   * Render fields using LayoutEngine for row/percentage layout
   */
  const renderFields = () => {
    if (!eventType.fields || eventType.fields.length === 0) {
      return <div className="no-fields">No fields defined</div>;
    }

    return (
      <div className="fields-container">
        <LayoutEngine fields={eventType.fields}>
          {(field) => (
            <FieldRenderer 
              key={field.name}
              field={field} 
              componentKey={componentKey}
            />
          )}
        </LayoutEngine>
      </div>
    );
  };

  /**
   * Render actions using ActionHandler
   */
  const renderActions = () => {
    if (!eventType.actions || eventType.actions.length === 0) {
      return null;
    }

    return (
      <div className="actions-container">
        <ActionHandler 
          actions={eventType.actions}
          eventType={eventType}
          componentKey={componentKey}
        />
      </div>
    );
  };

  /**
   * Render debug information for Studio preview
   */
  const renderDebugInfo = () => {
    const hasOverrides = eventType.fieldOverrides && eventType.fieldOverrides.length > 0;
    const hasWorkflows = eventType.workflowTriggers && Object.keys(eventType.workflowTriggers).length > 0;

    if (!hasOverrides && !hasWorkflows) return null;

    return (
      <div className="debug-info">
        {hasOverrides && (
          <div className="field-overrides">
            <h5>Field Overrides:</h5>
            {eventType.fieldOverrides.map((override, index) => (
              <div key={index} className="override-item">
                <strong>{override.fieldName}:</strong> {JSON.stringify(override)}
              </div>
            ))}
          </div>
        )}

        {hasWorkflows && (
          <div className="workflow-info">
            <h5>Workflows:</h5>
            <div className="workflow-triggers">
              {Object.entries(eventType.workflowTriggers).map(([trigger, actions]) => (
                <div key={trigger} className="trigger-item">
                  <strong>{trigger}:</strong> {actions.join(', ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="leaf-renderer" data-category={eventType.category}>
      {renderLeafByCategory()}
    </div>
  );
};

export default LeafRenderer;