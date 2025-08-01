/**
 * Create Plan Form Component
 *
 * Web-based interface for creating new plans (replaces CLI create-plan.js)
 */

import React, { useState, useEffect } from "react";
import { Grid, Button, Typography, Alert, Box, Chip } from "@mui/material";

// Import our form components
import {
  TextArea,
  TextField,
  Select,
} from "@whatsfresh/shared-imports/jsx";

// Import workflow registry for plan operations
import { workflowRegistry } from "../../workflows/WorkflowRegistry.js";

// Import workflow configuration
import { getComponentWorkflowConfig } from "../../config/workflowConfig.js";

// Load configuration data from centralized config
import {
  getClusterOptions,
  getPriorityOptions,
  getComplexityOptions,
} from "../../config/index.js";

const CLUSTER_OPTIONS = getClusterOptions() || [];
const COMPLEXITY_OPTIONS = getComplexityOptions() || [];
const PRIORITY_OPTIONS = getPriorityOptions() || [];

const CreatePlanForm = () => {
  const [formData, setFormData] = useState({
    cluster: "",
    planName: "",
    description: "",
    complexity: "medium",
    priority: "normal",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Listen for reset events from the header button
  useEffect(() => {
    const handleReset = (event) => {
      if (event.detail.tool === "create-plan") {
        setFormData({
          cluster: "",
          planName: "",
          description: "",
          complexity: "medium",
          priority: "normal",
        });
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
      // Use createPlan workflow for plan creation
      const workflowContext = {
        cluster: formData.cluster,
        name: formData.planName,
        description: formData.description,
        priority: formData.priority,
        complexity: formData.complexity,
        phase: "idea", // Default phase for new plans
      };

      // Get proper userID - firstName from contextStore for user actions
      const { contextStore } = await import("@whatsfresh/shared-imports");
      const userID = contextStore.getParameter("firstName") || "user";
      workflowContext.userID = userID;

      console.log("Executing createPlan workflow:", workflowContext);
      const workflowOptions = getComponentWorkflowConfig("form");
      const result = await workflowRegistry.execute(
        "createPlan",
        workflowContext,
        workflowOptions
      );

      if (result && result.success) {
        setSubmitResult({
          success: true,
          planId: result.data.planId,
          message: `Plan created successfully! (Workflow: ${result.executionId})`,
          details: result.data.details,
        });

        // Reset form on success
        setFormData({
          cluster: "",
          planName: "",
          description: "",
          complexity: "medium",
          priority: "normal",
        });
      } else {
        setSubmitResult({
          success: false,
          message: result?.error?.message || "Workflow execution failed",
        });
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      setSubmitResult({
        success: false,
        message: `Failed to create plan: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.cluster && formData.planName && formData.description;

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
          {/* Cluster Selection */}
          <Select
            label="Cluster"
            value={formData.cluster}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, cluster: value }))
            }
            options={CLUSTER_OPTIONS}
          />

          {/* Complexity */}
          <Select
            label="Complexity"
            value={formData.complexity}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, complexity: value }))
            }
            options={COMPLEXITY_OPTIONS}
          />

          {/* Priority */}
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, priority: value }))
            }
            options={PRIORITY_OPTIONS}
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
            {isSubmitting ? "Creating..." : "Create Plan"}
          </Button>
        </Grid>

        {/* Right Column - Content */}
        <Grid item xs={12} md={8}>
          {/* Plan Name - Wider field */}
          <Box sx={{ width: "100%", maxWidth: "800px" }}>
            <TextField
              label="Plan Name"
              value={formData.planName}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, planName: value }))
              }
              placeholder="e.g., User Authentication System"
            />
          </Box>

          {/* Form Status - Moved above description */}
          <Box sx={{ mb: 2 }}>
            {isFormValid ? (
              <Chip label="Ready to Create" color="success" size="small" />
            ) : (
              <Chip label="Fill Required Fields" color="default" size="small" />
            )}
          </Box>

          {/* Plan Description - 80 character width */}
          <TextArea
            label="Plan Description"
            value={formData.description}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
            minRows={15}
            maxRows={25}
            sx={{ fontFamily: 'monospace', width: '80ch', maxWidth: '100%' }}
            placeholder={`# User Idea
The User should have a way to get in on the communication loop... Since the new dashboard kiro created is in place, I'm wondering if kiro could create an interface form so I can put in my 2 cents in strategic places...

## Implementation Strategy
[Describe your approach here...]

## Requirements
- Requirement 1
- Requirement 2

## Expected Outcomes
[What should this accomplish...]`}
          />
        </Grid>


        {/* Preview */}
        {isFormValid && (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                Plan Preview
              </Typography>
              <Typography variant="body2">
                <strong>Cluster:</strong> {formData.cluster} |
                <strong> Name:</strong> {formData.planName} |
                <strong> Complexity:</strong> {formData.complexity} |
                <strong> Priority:</strong> {formData.priority}
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CreatePlanForm;
