#!/usr/bin/env node

/**
 * Simple test script to verify event system is working
 */

// Mock localStorage for Node.js environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

import { api } from "../../packages/shared-imports/src/api/index.js";

async function testEvents() {
  try {
    console.log("Testing planList event...");
    const plansResponse = await api.execEvent("planList");

    console.log(
      "Full planList response:",
      JSON.stringify(plansResponse, null, 2)
    );

    // The API returns data directly as an array, not wrapped in success/data structure
    if (Array.isArray(plansResponse)) {
      console.log(`✅ planList success: Found ${plansResponse.length} plans`);

      if (plansResponse.length > 0) {
        // Find plan 18 specifically
        const plan18 = plansResponse.find((plan) => plan.id === 18);
        if (plan18) {
          console.log(`Found Plan 18: ${plan18.name}`);

          // Test planDocumentList with plan 18
          console.log(`\nTesting planDocumentList for plan 18...`);

          // Import contextStore to set parameter
          const { default: contextStore } = await import(
            "../../packages/shared-imports/src/stores/contextStore.js"
          );
          contextStore.setParameter("planID", 18);

          const docsResponse = await api.execEvent("planDocumentList");

          console.log(
            "Full planDocumentList response:",
            JSON.stringify(docsResponse, null, 2)
          );

          if (Array.isArray(docsResponse)) {
            console.log(
              `✅ planDocumentList success: Found ${docsResponse.length} documents`
            );
          } else {
            console.log(`❌ planDocumentList failed:`, docsResponse);
          }
        } else {
          console.log("❌ Plan 18 not found in response");
        }
      }
    } else {
      console.log(
        "❌ planList failed - unexpected response format:",
        plansResponse
      );
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testEvents();
