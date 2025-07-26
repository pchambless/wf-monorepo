#!/usr/bin/env node

/**
 * Quick utility to create a plan record in the database
 * For testing Plan 0019 document creation functionality
 */

// Mock localStorage for Node.js environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

import { api } from "../../packages/shared-imports/src/api/index.js";

async function createPlan19() {
  try {
    console.log("Creating Plan 19 record in database...");

    // Import contextStore to get firstName or set default
    const { default: contextStore } = await import(
      "../../packages/shared-imports/src/stores/contextStore.js"
    );

    // Get firstName from context, default to 'Paul' for user-created documents
    const firstName = contextStore.getParameter("firstName") || "Paul";

    const planData = {
      method: "INSERT",
      table: "api_wf.plans",
      data: {
        id: 19,
        cluster: "DEVTOOLS",
        name: "Planning Enhancements",
        status: "active",
        priority: "medium",
        description:
          "Database-First Planning System - Complete migration from file-based tracking to database-driven workflows",
        userID: 1, // Try numeric userID first to test basic functionality
      },
    };

    const response = await api.execDml("INSERT", planData);

    if (response.success) {
      console.log("✅ Plan 19 created successfully in database");
      console.log("Now you can test document creation for Plan 19");
    } else {
      console.error("❌ Failed to create Plan 19:", response.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createPlan19();
