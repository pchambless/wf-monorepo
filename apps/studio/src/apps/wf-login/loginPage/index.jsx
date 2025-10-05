import React, { useState, useEffect } from "react";
import DirectRenderer from '../../../rendering/DirectRenderer';
import pageConfig from "./pageConfig.json";

/**
 * Login Page - Database-generated login form
 * Renders itself using pageConfig.json (generated from database eventTypes)
 */
const LoginPage = ({ mode }) => {
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
        Loading Login Page...
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }}>
      <DirectRenderer config={config} />
    </div>
  );
};

export default LoginPage;