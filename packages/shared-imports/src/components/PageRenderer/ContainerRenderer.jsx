/**
 * ContainerRenderer - Handles container eventTypes
 * 
 * Renders tabs, pages, cards that contain other components
 * Manages component layout and child rendering
 */

import React from 'react';

const ContainerRenderer = ({ node, componentKey, renderChildTree }) => {
  const eventType = node.config;

  /**
   * Render container based on category
   */
  const renderContainerByCategory = () => {
    switch (eventType.category) {
      case 'tab':
        return renderTab();
      case 'page':
        return renderPage();
      case 'card':
        return renderCard();
      default:
        return renderGenericContainer();
    }
  };

  /**
   * Render tab container
   */
  const renderTab = () => (
    <div className="tab-container">
      <div className="tab-header">
        <h3 className="tab-title">{eventType.title}</h3>
        {eventType.purpose && <p className="tab-purpose">{eventType.purpose}</p>}
      </div>
      
      <div className="tab-content">
        {renderChildren()}
      </div>
      
      {renderWorkflowInfo()}
    </div>
  );

  /**
   * Render page container
   */
  const renderPage = () => (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">{eventType.title}</h2>
        {eventType.purpose && <p className="page-purpose">{eventType.purpose}</p>}
      </div>
      
      <div className="page-body">
        {renderChildren()}
      </div>
      
      {renderWorkflowInfo()}
    </div>
  );

  /**
   * Render card container
   */
  const renderCard = () => (
    <div className="card-container">
      <div className="card-header">
        <h4 className="card-title">{eventType.title}</h4>
        {eventType.purpose && <span className="card-purpose">{eventType.purpose}</span>}
      </div>
      
      <div className="card-body">
        {renderChildren()}
      </div>
      
      {renderWorkflowInfo()}
    </div>
  );

  /**
   * Render generic container for unknown categories
   */
  const renderGenericContainer = () => (
    <div className={`container-${eventType.category}`}>
      <div className="container-header">
        <h3>{eventType.title}</h3>
        {eventType.purpose && <p className="purpose">{eventType.purpose}</p>}
      </div>

      <div className="container-body">
        {renderChildren()}
      </div>

      {renderWorkflowInfo()}
    </div>
  );

  /**
   * Render child components with position-based layout
   */
  const renderChildren = () => {
    if (!node.children || node.children.length === 0) {
      return <div className="no-children">No child components</div>;
    }

    // Group children by position if available
    const positionedChildren = groupChildrenByPosition(node.children);

    return (
      <div className="children-container">
        {positionedChildren.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`} className="child-group">
            {group.map((child, childIndex) => (
              <div 
                key={`${child.eventType}-${childIndex}`}
                className="child-wrapper"
                style={getChildStyle(child, eventType.components)}
              >
                {renderChildTree(child, 1)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  /**
   * Group children by their position attributes
   */
  const groupChildrenByPosition = (children) => {
    // If no position info, render sequentially
    if (!eventType.components || eventType.components.length === 0) {
      return [children];
    }

    // Group by row if position info exists
    const rows = {};
    
    children.forEach((child, index) => {
      const componentConfig = eventType.components.find(c => c.id === child.eventType);
      const row = componentConfig?.position?.row || 1;
      
      if (!rows[row]) rows[row] = [];
      rows[row].push(child);
    });

    return Object.values(rows);
  };

  /**
   * Get styling for child component based on position/span
   */
  const getChildStyle = (child, components) => {
    if (!components) return {};

    const componentConfig = components.find(c => c.id === child.eventType);
    if (!componentConfig) return {};

    const style = {};

    // Apply position-based styling
    if (componentConfig.position) {
      const { col } = componentConfig.position;
      if (col) {
        style.order = col;
      }
    }

    // Apply span-based sizing
    if (componentConfig.span) {
      const { cols } = componentConfig.span;
      if (cols) {
        style.flex = cols;
      }
    }

    // Apply custom props styling
    if (componentConfig.props?.style) {
      Object.assign(style, componentConfig.props.style);
    }

    return style;
  };

  /**
   * Render workflow information for debugging
   */
  const renderWorkflowInfo = () => {
    if (!eventType.workflowTriggers) return null;

    return (
      <div className="workflow-info">
        <small>
          Workflows: {Object.keys(eventType.workflowTriggers).join(', ')}
        </small>
      </div>
    );
  };

  return (
    <div className="container-renderer" data-category={eventType.category}>
      {renderContainerByCategory()}
    </div>
  );
};

export default ContainerRenderer;