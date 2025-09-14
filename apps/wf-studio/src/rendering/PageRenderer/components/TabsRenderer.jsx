/**
 * TabsRenderer - Tabs component with CSS classes
 */

import React, { useState, useEffect } from "react";
import { workflowEngine } from "../../WorkflowEngine/index.js";

const TabsRenderer = ({ component, onEvent, children }) => {
  const { props, components = [] } = component;
  const [activeTab, setActiveTab] = useState(0);

  // Auto-switch to Component Detail tab when eventTypeID is set
  useEffect(() => {
    const contextStore = workflowEngine?.contextStore;
    if (!contextStore) return;

    const unsubscribe = contextStore.subscribe('eventTypeID', (eventTypeID) => {
      if (eventTypeID[1]) { // eventTypeID is set
        // Find tabEventDtl index
        const tabEventDtlIndex = components.findIndex(tab => tab.id === 'tabEventDtl');
        if (tabEventDtlIndex !== -1) {
          console.log(`🔄 TabsRenderer: Auto-switching to Component Detail tab (index ${tabEventDtlIndex})`);
          setActiveTab(tabEventDtlIndex);
        }
      }
    });

    return unsubscribe;
  }, [components]);

  return (
    <div className="wf-tabs" style={props?.style}>
      {props?.title && <h3 className="wf-title">{props.title}</h3>}
      
      <div className="wf-tab-headers">
        {components.map((tab, index) => (
          <button
            key={tab.id || index}
            className={`wf-tab-header ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.title || tab.props?.title || tab.id || `Tab ${index + 1}`}
          </button>
        ))}
      </div>
      
      <div className="wf-tab-content">
        {React.Children.toArray(children)[activeTab] || (
          <p>No tab content</p>
        )}
      </div>
    </div>
  );
};

export default TabsRenderer;