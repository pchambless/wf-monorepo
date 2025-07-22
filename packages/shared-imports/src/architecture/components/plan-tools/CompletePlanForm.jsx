/**
 * Complete Plan Form Component
 *
 * Web-based interface for completing plans (replaces CLI complete-plan.js)
 */

import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Alert,
  Box,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

// Mock active plans (would come from plan registry in real implementation)
const MOCK_ACTIVE_PLANS = [
  { id: "0011", name: "Complete DML Process", cluster: "API", status: "ready" },
  {
    id: "0012",
    name: "React PDF Worksheet System",
    cluster: "REPORTS",
    status: "in-progress",
  },
  {
    id: "0013",
    name: "Server Log Enhancements",
    cluster: "API",
    status: "ready",
  },
  { id: "0014", name: "Log Cleanup", cluster: "LOGGING", status: "blocked" },
  {
    id: "0015",
    name: "Client Cleanup Artifacts",
    cluster: "CLIENT",
    status: "completed",
  },
];

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

const CompletePlanForm = () => {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [completionStatus, setCompletionStatus] = useState("completed");
  const [completionNotes, setCompletionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Simulate plan completion (Phase 2 implementation)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call to complete-plan functionality
      const plan = MOCK_ACTIVE_PLANS.find((p) => p.id === selectedPlan);

      setSubmitResult({
        success: true,
        message: `Plan ${selectedPlan} (${plan?.name}) marked as ${completionStatus}!`,
      });

      // Reset form
      setSelectedPlan("");
      setCompletionStatus("completed");
      setCompletionNotes("");
    } catch (error) {
      setSubmitResult({
        success: false,
        message: `Failed to complete plan: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlanData = MOCK_ACTIVE_PLANS.find((p) => p.id === selectedPlan);
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
        {/* Plan Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Plan to Complete</InputLabel>
            <Select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              label="Select Plan to Complete"
            >
              {MOCK_ACTIVE_PLANS.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">
                        Plan {plan.id} - {plan.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {plan.cluster} | Status: {plan.status}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={plan.status}
                      color={
                        plan.status === "ready"
                          ? "success"
                          : plan.status === "completed"
                          ? "default"
                          : plan.status === "blocked"
                          ? "error"
                          : "warning"
                      }
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Completion Status */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Completion Status</InputLabel>
            <Select
              value={completionStatus}
              onChange={(e) => setCompletionStatus(e.target.value)}
              label="Completion Status"
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body1">{status.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Completion Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Completion Notes"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add notes about the completion, any issues encountered, or follow-up items..."
            helperText="Optional notes about the plan completion"
          />
        </Grid>

        {/* Selected Plan Details */}
        {selectedPlanData && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Plan Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">Plan ID</Typography>
                    <Typography variant="body1">
                      {selectedPlanData.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">Cluster</Typography>
                    <Typography variant="body1">
                      {selectedPlanData.cluster}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">Current Status</Typography>
                    <Chip
                      label={selectedPlanData.status}
                      size="small"
                      color={
                        selectedPlanData.status === "ready"
                          ? "success"
                          : selectedPlanData.status === "completed"
                          ? "default"
                          : selectedPlanData.status === "blocked"
                          ? "error"
                          : "warning"
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Plan Name</Typography>
                    <Typography variant="body1">
                      {selectedPlanData.name}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Form Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              sx={{ minWidth: 120 }}
            >
              {isSubmitting ? "Processing..." : "Complete Plan"}
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setSelectedPlan("");
                setCompletionStatus("completed");
                setCompletionNotes("");
              }}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>

            {/* Form Status */}
            <Box sx={{ ml: "auto" }}>
              {isFormValid ? (
                <Chip label="Ready to Complete" color="success" size="small" />
              ) : (
                <Chip label="Select Plan" color="default" size="small" />
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompletePlanForm;
