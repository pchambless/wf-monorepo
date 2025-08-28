import React, { useState, useEffect } from "react";
import StudioPageRenderer from "../../components/StudioPageRenderer";
import pageConfig from "./pageConfig.json";

/**
 * Studio Main Page - EventType Designer
 * Renders itself using pageConfig.json (generated from Studio's own eventTypes)
 */
const StudioPage = ({ mode }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the pageConfig (simulate async loading)
    setTimeout(() => {
      setConfig(pageConfig);
      setLoading(false);
    }, 100);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px",
        color: "#666"
      }}>
        Loading Studio Designer...
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }}>
      <StudioPageRenderer pageConfig={config} />
    </div>
  );
};

export default StudioPage;