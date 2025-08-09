/**
 * Plan Management Page - Phase 2: EventType Integration
 * Connected to eventType data with placeholder workflow execution
 * Will be enhanced with real workflow execution in Phase 3
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import { planManagementWorkflowMap } from "./workflowMap.js";
import {
  executeWorkflows,
  propagateContextUpdates,
} from "@whatsfresh/shared-imports/workflows/eventType";
import { execEvent } from "@whatsfresh/shared-imports/api";
import SelStatusWidget from "./components/SelStatusWidget.jsx";
import { handleError, retryOperation } from "./utils/errorHandler.js";

/**
 * Memoized Plan List Items for performance optimization
 */
const PlanListItems = memo(({ plans, selectedPlan, onPlanSelect }) => {
  return plans.map((plan) => (
    <div
      key={plan.id}
      style={{
        padding: "8px",
        border: selectedPlan === plan.id ? "2px solid blue" : "1px solid #ddd",
        marginBottom: "5px",
        cursor: "pointer",
        backgroundColor: selectedPlan === plan.id ? "#e6f3ff" : "white",
        transition: "all 0.2s ease", // Smooth transitions
      }}
      onClick={() => onPlanSelect(plan.id)}
    >
      {String(plan.id).padStart(4, "0")} - {plan.name}
    </div>
  ));
});

PlanListItems.displayName = "PlanListItems";

export const PlanManagement = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planDetail, setPlanDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  // Status options now handled by SelStatusWidget

  const loadPlans = useCallback(async () => {
    const operation = async () => {
      setLoading(true);
      setError(null);

      // Use established methodology - execEvent with eventType
      const result = await execEvent("planList");

      console.log("Raw API result:", result);

      if (result && (result.success || result.data || Array.isArray(result))) {
        // Handle different response formats
        let rawData = result.data || result || [];
        let filteredPlans = Array.isArray(rawData) ? rawData : [];

        console.log("Processed plans data:", filteredPlans);

        setPlans(filteredPlans);
        setRetryCount(0); // Reset retry count on success
        return filteredPlans;
      } else {
        throw new Error(result?.error || "Failed to load plans");
      }
    };

    try {
      await retryOperation(operation, {
        operationId: "loadPlans",
        context: { statusFilter },
      });
    } catch (error) {
      console.error("Error loading plans after retries:", error);

      const errorInfo = await handleError(error, {
        operation: "loadPlans",
        statusFilter,
        component: "PlanManagement",
      });

      setError(errorInfo);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  /**
   * Initialize page with workflow execution
   */
  const initializePage = useCallback(async () => {
    try {
      console.log("Phase 4: Initializing Plan Management page");

      // Execute page load workflows
      const workflowResult = await planManagementWorkflowMap.onPageLoad({
        userId: "current-user",
        timestamp: new Date().toISOString(),
      });

      console.log("Page initialization workflow result:", workflowResult);

      // Load initial data
      await loadPlans();
    } catch (error) {
      console.error("Error initializing page:", error);
    }
  }, [loadPlans]);

  /**
   * Handle page cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Execute page exit workflows on cleanup
      planManagementWorkflowMap
        .onPageExit({
          userId: "current-user",
          timestamp: new Date().toISOString(),
          sessionDuration: Date.now() - (window.pageLoadTime || Date.now()),
        })
        .catch((error) => {
          console.error("Error in page exit workflow:", error);
        });
    };
  }, []);

  // Phase 4: Page load with workflow execution
  useEffect(() => {
    initializePage();
  }, [initializePage]);

  // Load plans when status filter changes
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Phase 4: Enhanced plan selection with page-level workflows
  const handlePlanSelect = async (planId) => {
    console.log("Phase 4: Plan selected:", planId);

    try {
      // Execute page-level plan selection workflow
      const pageWorkflowResult = await planManagementWorkflowMap.onPlanSelect(
        planId,
        {
          userId: "current-user",
          timestamp: new Date().toISOString(),
        }
      );

      console.log(
        "Page-level plan selection workflow result:",
        pageWorkflowResult
      );

      // Execute component-level onSelect workflows for planList
      const componentWorkflowResult = await executeWorkflows(
        "planList",
        "onSelect",
        {
          planId,
          userId: "current-user",
          timestamp: new Date().toISOString(),
        }
      );

      console.log("Component-level workflow result:", componentWorkflowResult);

      // Update selected plan state
      setSelectedPlan(planId);

      // Load plan details using established methodology
      const result = await execEvent("planDetailList", { ":planID": planId });

      if (result && result.success && result.data?.length > 0) {
        setPlanDetail(result.data[0]);
        console.log("Plan detail loaded:", result.data[0]);
      } else {
        console.warn("No plan detail data received");
        setPlanDetail(null);
      }

      // Handle context refresh if workflow succeeded
      if (
        componentWorkflowResult.success &&
        componentWorkflowResult.contextRefreshResult
      ) {
        await handleContextUpdates(
          componentWorkflowResult.contextRefreshResult
        );
      }
    } catch (error) {
      console.error("Error in plan selection:", error);

      const errorInfo = await handleError(error, {
        operation: "planSelection",
        planId,
        component: "PlanManagement",
      });

      // Don't set global error for plan selection failures, just clear detail
      setPlanDetail(null);

      // Could show a toast notification here instead
      console.warn("Plan selection failed:", errorInfo.userMessage);
    }
  };

  const handleStatusFilter = async (status) => {
    console.log("Phase 3: Status filter:", status);

    try {
      // Execute onSelect workflows for select-PlanStatus
      const workflowResult = await executeWorkflows(
        "select-PlanStatus",
        "onSelect",
        {
          status,
          userId: "current-user",
          timestamp: new Date().toISOString(),
        }
      );

      console.log("Status filter workflow result:", workflowResult);

      // Update status filter state
      setStatusFilter(status);

      // Handle context refresh if workflow succeeded
      if (workflowResult.success && workflowResult.contextRefreshResult) {
        await handleContextUpdates(workflowResult.contextRefreshResult);
      }
    } catch (error) {
      console.error("Error in status filter:", error);
    }
  };

  // Phase 3: Handle context updates from workflow execution
  const handleContextUpdates = async (contextRefreshResult) => {
    try {
      if (!contextRefreshResult.success) {
        console.warn("Context refresh failed:", contextRefreshResult.error);
        return;
      }

      // Update UI state based on refreshed contexts
      await propagateContextUpdates(
        contextRefreshResult,
        async (contextType, data) => {
          switch (contextType) {
            case "planList":
              console.log("Updating plan list from context:", data);
              setPlans(Array.isArray(data) ? data : []);
              break;
            case "planContext":
              console.log("Updating plan detail from context:", data);
              setPlanDetail(data);
              break;
            case "communicationHistory":
              console.log("Communication history updated:", data);
              // Future: Update communication state
              break;
            case "impactTracking":
              console.log("Impact tracking updated:", data);
              // Future: Update impact state
              break;
            default:
              console.log(`Unknown context type: ${contextType}`);
          }
        }
      );

      console.log("Context updates propagated successfully");
    } catch (error) {
      console.error("Error handling context updates:", error);
    }
  };

  return (
    <div
      className="plan-management-page"
      style={{ padding: "20px", height: "100vh" }}
    >
      {/* Header Section */}
      <div className="plan-management-header" style={{ marginBottom: "20px" }}>
        <h1>Plan Management</h1>

        {/* Phase 4: Error Display */}
        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "15px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              color: "#dc2626",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>Error:</strong> {error.userMessage}
                {error.isRetryable && (
                  <div style={{ marginTop: "8px" }}>
                    <button
                      onClick={() => {
                        setError(null);
                        loadPlans();
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#dc2626",
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Phase 4: SelStatusWidget with CONFIG method */}
        <SelStatusWidget
          onStatusChange={handleStatusFilter}
          currentStatus={statusFilter}
          showCounts={true}
          showAllOption={true}
        />
      </div>

      {/* Main Content - Master-Detail Layout */}
      <div
        className="plan-management-content"
        style={{
          display: "flex",
          height: "calc(100vh - 120px)",
          gap: "20px",
        }}
      >
        {/* Master Section - Plan List */}
        <div
          className="plan-list-section"
          style={{
            width: "300px",
            border: "2px dashed #ccc",
            padding: "15px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>Plan List (Master)</h3>
          <p>
            <strong>Display Format:</strong> NNNN-name
          </p>
          <p>
            <strong>Status Filter:</strong> {statusFilter || "All"}
          </p>

          {/* Phase 4: Optimized plan list with memoization */}
          <div style={{ marginTop: "15px" }}>
            {loading ? (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#666" }}
              >
                <div>Loading plans...</div>
                <div style={{ fontSize: "12px", marginTop: "5px" }}>
                  {retryCount > 0 && `Retry attempt: ${retryCount}`}
                </div>
              </div>
            ) : error ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#dc2626",
                }}
              >
                <div>Failed to load plans</div>
                <div style={{ fontSize: "12px", marginTop: "5px" }}>
                  {error.userMessage}
                </div>
              </div>
            ) : plans.length === 0 ? (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#666" }}
              >
                No plans found
                {statusFilter && (
                  <div style={{ fontSize: "12px", marginTop: "5px" }}>
                    Try clearing the status filter
                  </div>
                )}
              </div>
            ) : (
              <PlanListItems
                plans={plans}
                selectedPlan={selectedPlan}
                onPlanSelect={handlePlanSelect}
              />
            )}
          </div>
        </div>

        {/* Detail Section - Plan Detail Tabs */}
        <div
          className="plan-detail-section"
          style={{
            flex: 1,
            border: "2px dashed #ccc",
            padding: "15px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {selectedPlan ? (
            <div>
              <h3>Plan Detail Tabs (Detail)</h3>
              <p>
                <strong>Selected Plan:</strong> {selectedPlan}
              </p>

              {/* Phase 1: Static tab interface */}
              <div style={{ marginTop: "15px" }}>
                <div
                  style={{
                    borderBottom: "1px solid #ddd",
                    marginBottom: "15px",
                  }}
                >
                  <button
                    style={{
                      padding: "8px 16px",
                      marginRight: "5px",
                      border: "1px solid #ddd",
                      backgroundColor: "#fff",
                    }}
                  >
                    Plan Detail
                  </button>
                  <button
                    style={{
                      padding: "8px 16px",
                      marginRight: "5px",
                      border: "1px solid #ddd",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    Communications
                  </button>
                  <button
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ddd",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    Impacts
                  </button>
                </div>

                {/* Phase 2: Dynamic tab content from eventType data */}
                <div
                  style={{
                    padding: "15px",
                    border: "1px solid #eee",
                    backgroundColor: "white",
                  }}
                >
                  <h4>Plan Detail Tab Content</h4>
                  {planDetail ? (
                    <>
                      <p>
                        <strong>Plan Name:</strong> {planDetail.name}
                      </p>
                      <p>
                        <strong>Status:</strong> {planDetail.status}
                      </p>
                      <p>
                        <strong>Description:</strong> {planDetail.description}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {new Date(planDetail.created_at).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Created By:</strong> {planDetail.created_by}
                      </p>
                    </>
                  ) : (
                    <p>
                      <em>Loading plan details...</em>
                    </p>
                  )}
                  <p>
                    <em>
                      Phase 3: Dynamic content from eventType with workflow
                      execution and context management
                    </em>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#666",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h3>No Plan Selected</h3>
                <p>Select a plan from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase 3: Debug Info */}
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#e1f5fe",
          border: "1px solid #81d4fa",
          fontSize: "12px",
        }}
      >
        <strong>Phase 3 Debug:</strong>
        {/* Phase 4: Enhanced Debug Info */}
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            fontSize: "12px",
          }}
        >
          <strong>Phase 4 Complete:</strong>
          WorkflowMap: {planManagementWorkflowMap.pageId} | Plans:{" "}
          {plans.length} | Selected: {selectedPlan || "None"} | Filter:{" "}
          {statusFilter || "All"} | Loading: {loading ? "Yes" : "No"} | Error:{" "}
          {error ? error.errorType : "None"} | Retries: {retryCount} | Features:
          Workflows ✓ Context ✓ Error Handling ✓ Performance ✓
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;
