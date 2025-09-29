/**
 * 🚀 PageRenderer - Clean Modular Implementation
 *
 * Pure pageConfig processor with CSS-driven modular components
 * All business logic handled by WorkflowEngine
 */

import React, { useEffect, useState } from "react";
import { workflowEngine } from "../WorkflowEngine/index.js";
// Database-driven context - no local context store needed
import LayoutRenderer from "./LayoutRenderer.jsx";
import "../../styles/base-components.css";

const PageRenderer = ({ config }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize WorkflowEngine (now uses database-driven context)
    workflowEngine.initialize();

    // Execute page-level onLoad workflow triggers if they exist
    if (config?.workflowTriggers?.onLoad) {
      console.log(
        "🚀 Executing page onLoad workflow:",
        config.workflowTriggers.onLoad
      );

      // Handle different workflow trigger formats
      const triggers = config.workflowTriggers.onLoad;
      if (Array.isArray(triggers)) {
        triggers.forEach((trigger) => {
          if (typeof trigger === "string") {
            // Simple action: "execApps"
            workflowEngine.execAction(trigger, { config, contextStore });
          } else if (trigger.action && trigger.targets) {
            // Action-target pattern: {"action": "refresh", "targets": ["selectPage"]}
            workflowEngine.execTargetAction(trigger.action, trigger.targets, {
              config,
              contextStore,
            });
          }
        });
      }
    }

    setLoading(false);
  }, [config, contextStore]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!config) {
    return <div style={{ padding: "20px" }}>No config provided</div>;
  }

  return <LayoutRenderer config={config} />;
};


export default PageRenderer;
