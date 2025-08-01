/**
 * Plan Status Update Form Component
 *
 * Universal plan status management interface (renamed from CompletePlanForm)
 * Supports all plan status transitions with reliable TextArea widget
 */

import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Grid,
  Button,
  Typography,
  Alert,
  Box,
  Chip,
  Card,
  CardContent,
} from "@mui/material";

// Import our form components - using TextArea instead of MultiLineField
import { TextArea, TextField, Select } from "@whatsfresh/shared-imports/jsx";

// Import context store to get selected plan
import { useContextStore } from "@whatsfresh/shared-imports/stores/contextStore";

// Import workflow registry and configuration
import {
  workflowRegistry,
  getComponentWorkflowConfig,
} from "../../workflows/index.js";

// Load status options from selectVals configuration
const loadStatusOptions = async () => {
  try {
    const { default: selectVals } = await import(
      "../../config/selectVals.json"
    );

    // Extract choices from planStatus configuration and sort by order
    if (selectVals.planStatus && selectVals.planStatus.choices) {
      return selectVals.planStatus.choices
        .sort((a, b) => a.ordr - b.ordr)
        .map((choice) => ({
          value: choice.value,
          label: choice.label,
          color: choice.color,
        }));
    }

    throw new Error("planStatus configuration not found in selectVals");
  } catch (error) {
    console.error("Failed to load status options from selectVals:", error);
    // Fallback status options matching selectVals structure
    return [
      { value: "new", label: "New", color: "slate" },
      { value: "active", label: "Active", color: "blue" },
      { value: "in-progress", label: "In Progress", color: "green" },
      { value: "on-hold", label: "On Hold", color: "yellow" },
      { value: "completed", label: "Completed", color: "emerald" },
      { value: "ongoing", label: "Ongoing", color: "purple" },
      { value: "archived", label: "Archived", color: "gray" },
    ];
  }
};

const PlanStatusUpdateForm = observer(() => {
  const [statusValue, setStatusValue] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [statusOptions, setStatusOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Get selected plan from context store (set by SelPlan widget)
  const contextStore = useContextStore();
  const selectedPlan = contextStore.getParameter("planID");

  // Load status options on component mount
  useEffect(() => {
    const initializeStatusOptions = async () => {
      const options = await loadStatusOptions();
      setStatusOptions(options);

      // Set default status if none selected
      if (!statusValue && options.length > 0) {
        setStatusValue(options[0].value);
      }
    };

    initializeStatusOptions();
  }, []);

  // Listen for reset events from the header button
  useEffect(() => {
    const handleReset = (event) => {
      if (event.detail.tool === "plan-status-update") {
        setStatusValue(statusOptions.length > 0 ? statusOptions[0].value : "");
        setStatusNotes("");
        setSubmitResult(null);
      }
    };

    window.addEventListener("resetForm", handleReset);
    return () => window.removeEventListener("resetForm", handleReset);
  }, [statusOptions]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Use updatePlan workflow for plan status updates
      const workflowContext = {
        planId: parseInt(selectedPlan),
        updateData: {
          status: statusValue,
          notes: statusNotes,
          // Add completion timestamp for completed status
          ...(statusValue === "completed" && {
            completed_at: new Date().toISOString(),
          }),
        },
        userID: contextStore.getParameter("firstName") || "user",
      };

      console.log("Executing updatePlan workflow:", workflowContext);

      // Debug: Check if workflow is registered
      const availableWorkflows = workflowRegistry.listWorkflows();
      console.log("Available workflows:", availableWorkflows);

      const workflowOptions = getComponentWorkflowConfig("form");
      const result = await workflowRegistry.execute(
        "updatePlan",
        workflowContext,
        workflowOptions
      );

      if (result && result.success) {
        const selectedStatusOption = statusOptions.find(
          (opt) => opt.value === statusValue
        );
        const statusLabel = selectedStatusOption?.label || statusValue;

        setSubmitResult({
          success: true,
          message: `Plan ${selectedPlan} status updated to ${statusLabel}! (Workflow: ${result.executionId})`,
        });

        // Context refresh is handled automatically by the workflow
        // Reset form
        setStatusValue(statusOptions.length > 0 ? statusOptions[0].value : "");
        setStatusNotes("");
      } else {
        throw new Error(result?.error?.message || "Workflow execution failed");
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: `Failed to update plan status: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedPlan && statusValue;
  const selectedStatusOption = statusOptions.find(
    (opt) => opt.value === statusValue
  );

  // Debug logging for troubleshooting
  console.log("PlanStatusUpdateForm Debug:", {
    selectedPlan,
    statusValue,
    isFormValid,
    statusOptionsCount: statusOptions.length,
    contextStoreParams: contextStore.getAllParameters(),
  });

  return (
    <Box>
      {submitResult && (
        <Alert
          severity={submitResult.success ? "success" : "error"}
          sx={{ mb: 3 }}
          onClose={() => setSubmitResult(null)}
        >
          {submitResult.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Controls */}
        <Grid item xs={12} md={4}>
          {/* Selected Plan Display */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            {selectedPlan
              ? `Updating Plan ${selectedPlan}`
              : "No Plan Selected"}
          </Typography>

          {/* Plan Status Dropdown with Color Coding */}
          <Select
            label="Plan Status"
            value={statusValue}
            onChange={(value) => setStatusValue(value)}
            options={statusOptions}
          />

          {/* Status Preview */}
          {selectedStatusOption && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Chip
                label={selectedStatusOption.label}
                color={selectedStatusOption.color}
                size="small"
              />
            </Box>
          )}

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            fullWidth
            sx={{ mt: 2 }}
          >
            {isSubmitting ? "Updating..." : "Update Plan Status"}
          </Button>
        </Grid>

        {/* Right Column - Content */}
        <Grid item xs={12} md={8}>
          {/* Status Update Notes - Using reliable TextArea widget */}
          <TextArea
            label="Status Update Notes"
            value={statusNotes}
            onChange={(value) => setStatusNotes(value)}
            minRows={8}
            placeholder="Add notes about the status change, any issues encountered, or follow-up items..."
          />
        </Grid>

        {/* Form Status */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {isFormValid ? (
              <Chip label="Ready to Update" color="success" size="small" />
            ) : (
              <Chip label="No Plan Selected" color="default" size="small" />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

export default PlanStatusUpdateForm;
