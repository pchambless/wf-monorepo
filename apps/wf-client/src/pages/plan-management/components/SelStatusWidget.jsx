/**
 * SelStatusWidget - Phase 4: CONFIG Method Implementation
 * Status filtering widget that loads from selectVals.json planStatus
 * Displays plan counts for each status with filtering functionality
 */

import React, { useState, useEffect, useCallback } from "react";
import { execEvent } from "@whatsfresh/shared-imports/api";
import { executeWorkflows } from "@whatsfresh/shared-imports/workflows/eventType";
import { getConfigData } from "@whatsfresh/shared-imports/workflows/eventType";

export const SelStatusWidget = ({
  onStatusChange,
  currentStatus = null,
  showCounts = true,
  showAllOption = true,
}) => {
  const [statusOptions, setStatusOptions] = useState([]);
  const [planCounts, setPlanCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load status options using selectValsHelper utility
   */
  const loadStatusOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load from eventType CONFIG method - clean and declarative!
      const options = getConfigData("select-PlanStatus");

      if (options && options.length > 0) {
        setStatusOptions(options);
        console.log("Status options loaded from selectVals.json:", options);
      } else {
        throw new Error("planStatus configuration not found or empty");
      }
    } catch (error) {
      console.error("Error loading status options:", error);
      setError("Failed to load status options from configuration");

      // Use fallback options if selectVals.json fails
      setStatusOptions([
        { value: "new", label: "New", color: "slate", ordr: 1 },
        { value: "active", label: "Active", color: "blue", ordr: 2 },
        { value: "in-progress", label: "In Progress", color: "green", ordr: 3 },
        { value: "completed", label: "Completed", color: "emerald", ordr: 5 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load status options using CONFIG method
  useEffect(() => {
    loadStatusOptions();
  }, [loadStatusOptions]);

  /**
   * Load plan counts for each status
   */
  const loadPlanCounts = useCallback(async () => {
    try {
      // Get all plans to count by status
      const result = await execEvent("planList");

      if (result && result.success && result.data) {
        const plans = result.data;
        const counts = {};

        // Count plans by status
        statusOptions.forEach((option) => {
          counts[option.value] = plans.filter(
            (plan) => plan.status === option.value
          ).length;
        });

        // Count total plans
        counts.total = plans.length;

        setPlanCounts(counts);
      }
    } catch (error) {
      console.error("Error loading plan counts:", error);
    }
  }, [statusOptions]);

  // Load plan counts when status options are loaded
  useEffect(() => {
    if (statusOptions.length > 0 && showCounts) {
      loadPlanCounts();
    }
  }, [statusOptions, showCounts, loadPlanCounts]);

  /**
   * Handle status selection with workflow execution
   */
  const handleStatusChange = async (selectedStatus) => {
    try {
      // Execute workflow for status selection
      await executeWorkflows("SelPlanStatus", "onSelect", {
        status: selectedStatus,
        userId: "current-user",
        timestamp: new Date().toISOString(),
      });

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(selectedStatus);
      }
    } catch (error) {
      console.error("Error in status change:", error);
    }
  };

  /**
   * Get color class for status
   */
  const getStatusColor = (color) => {
    const colorMap = {
      slate: "#64748b",
      blue: "#3b82f6",
      green: "#10b981",
      yellow: "#f59e0b",
      emerald: "#059669",
      purple: "#8b5cf6",
      gray: "#6b7280",
      red: "#ef4444",
    };
    return colorMap[color] || "#6b7280";
  };

  if (loading) {
    return (
      <div style={{ padding: "15px", textAlign: "center" }}>
        <div>Loading status options...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "15px", color: "#ef4444" }}>
        <div>Error: {error}</div>
        <button
          onClick={loadStatusOptions}
          style={{ marginTop: "10px", padding: "5px 10px" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="sel-status-widget"
      style={{
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <strong>Status Filter</strong>
        {showCounts && planCounts.total && (
          <span style={{ marginLeft: "10px", color: "#666", fontSize: "14px" }}>
            ({planCounts.total} total plans)
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {/* All Statuses Option */}
        {showAllOption && (
          <button
            onClick={() => handleStatusChange(null)}
            style={{
              padding: "8px 12px",
              border:
                currentStatus === null ? "2px solid #3b82f6" : "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: currentStatus === null ? "#eff6ff" : "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: currentStatus === null ? "600" : "normal",
            }}
          >
            All Statuses
            {showCounts && planCounts.total && (
              <span style={{ marginLeft: "6px", color: "#666" }}>
                ({planCounts.total})
              </span>
            )}
          </button>
        )}

        {/* Individual Status Options */}
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            style={{
              padding: "8px 12px",
              border:
                currentStatus === option.value
                  ? "2px solid #3b82f6"
                  : "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor:
                currentStatus === option.value ? "#eff6ff" : "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: currentStatus === option.value ? "600" : "normal",
              borderLeftColor: option.color
                ? getStatusColor(option.color)
                : "#ccc",
              borderLeftWidth: "4px",
            }}
          >
            {option.label}
            {showCounts && planCounts[option.value] !== undefined && (
              <span style={{ marginLeft: "6px", color: "#666" }}>
                ({planCounts[option.value]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <div style={{ marginTop: "12px", textAlign: "right" }}>
        <button
          onClick={() => {
            loadStatusOptions();
            if (showCounts) loadPlanCounts();
          }}
          style={{
            padding: "4px 8px",
            border: "1px solid #ccc",
            borderRadius: "3px",
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
            fontSize: "12px",
            color: "#666",
          }}
        >
          ↻ Refresh
        </button>
      </div>
    </div>
  );
};

export default SelStatusWidget;
