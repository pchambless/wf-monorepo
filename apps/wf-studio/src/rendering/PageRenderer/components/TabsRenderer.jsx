/**
 * TabsRenderer - Tabs component with CSS classes
 */

import React, { useState } from "react";

const TabsRenderer = ({ component, onEvent, children }) => {
  const { props, components = [] } = component;
  const [activeTab, setActiveTab] = useState(0);

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
            {tab.title || tab.id || `Tab ${index + 1}`}
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