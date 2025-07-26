/**
 * Complete Plan Form Component
 *
 * Web-based interface for completing plans (replaces CLI complete-plan.js)
 */

import React, { useState, useEffect } from "react";
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

// Import our form components
import {
  MultiLineField,
  TextField,
  Select,
} from "@whatsfresh/shared-imports/jsx";

// SelPlan widget handles plan loading automatically via planList event

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed Successfully", color: "success" },
  { value: "blocked", label: "Blocked - Cannot Complete", color: "error" },
  { value: "deferred", label: "Deferred - Postponed", color: "warning" },
  {
    value: "cancelled",
    label: "Cancelled - No Longer Needed",
    color: "default",
  },
];

const CompletePlanForm = ({ selectedPlan }) => {
  const [completionStatus, setCompletionStatus] = useState("completed");
  const [completionNotes, setCompletionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  // Uses selectedPlan from parent ArchDashboard

  // Listen for reset events from the header button
  useEffect(() => {
    const handleReset = (event) => {
      if (event.detail.tool === "complete-plan") {
        setCompletionStatus("completed");
        setCompletionNotes("");
        setSubmitResult(null);
      }
    };

    window.addEventListener("resetForm", handleReset);
    return () => window.removeEventListener("resetForm", handleReset);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Database-native plan completion (Plan 0018)
      const { execDml } = await import("@whatsfresh/shared-imports/api");

      const dmlData = {
        table: "api_wf.plans",
        method: "UPDATE",
        data: {
          status: completionStatus,
          completed_at:
            completionStatus === "completed" ? new Date().toISOString() : null,
          userID: "user", // DML processor handles audit fields automatically
        },
        where: { id: parseInt(selectedPlan) },
      };

      console.log("Updating plan status in database:", dmlData);
      const result = await execDml("UPDATE", dmlData);

      if (result && result.success) {
        // Plan name will be shown by plan ID

        setSubmitResult({
          success: true,
          message: `Plan ${selectedPlan} marked as ${completionStatus}!`,
        });

        // Reset form
        setCompletionStatus("completed");
        setCompletionNotes("");
      } else {
        throw new Error(result?.error || "Database update failed");
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: `Failed to complete plan: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedPlan && completionStatus;

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
            {selectedPlan ? `Completing Plan ${selectedPlan}` : "No Plan Selected"}
          </Typography>

          {/* Completion Status */}
          <Select
            label="Completion Status"
            value={completionStatus}
            onChange={(value) => setCompletionStatus(value)}
            options={STATUS_OPTIONS}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            fullWidth
            sx={{ mt: 2 }}
          >
            {isSubmitting ? "Processing..." : "Complete Plan"}
          </Button>
        </Grid>

        {/* Right Column - Content (Much Wider) */}
        <Grid item xs={12} md={8}>
          {/* Completion Notes - Much Wider Text Area */}
          <Box sx={{ width: "350%", maxWidth: "calc(100vw - 120px)" }}>
            <MultiLineField
              label="Completion Notes"
              value={completionNotes}
              onChange={(value) => setCompletionNotes(value)}
              minRows={8}
              placeholder="Add notes about the completion, any issues encountered, or follow-up items..."
            />
          </Box>
        </Grid>

        {/* Form Status */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {isFormValid ? (
              <Chip label="Ready to Complete" color="success" size="small" />
            ) : (
              <Chip label="No Plan Selected" color="default" size="small" />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompletePlanForm;
