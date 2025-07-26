/**
 * Create Plan Form Component
 *
 * Web-based interface for creating new plans (replaces CLI create-plan.js)
 */

import React, { useState, useEffect } from "react";
import { Grid, Button, Typography, Alert, Box, Chip } from "@mui/material";

// Import our form components
import {
  MultiLineField,
  TextField,
  Select,
} from "@whatsfresh/shared-imports/jsx";

// Import config data
import { getClusterOptions } from "../../../utils/configLoader.js";

// Import workflow functions
import { createPlan } from "../../workflows/plans";

// Load configuration data
const CLUSTER_OPTIONS = getClusterOptions() || [];

// Complexity options
const COMPLEXITY_OPTIONS = [
  { value: "low", label: "Low - Simple changes, minimal impact" },
  { value: "medium", label: "Medium - Moderate changes, some dependencies" },
  { value: "high", label: "High - Complex changes, significant impact" },
];

// Priority options
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low - Nice to have" },
  { value: "normal", label: "Normal - Standard priority" },
  { value: "high", label: "High - Important for business" },
  { value: "urgent", label: "Urgent - Blocking other work" },
];

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
      // Use atomic workflow module (Business Workflow Modules pattern)
      const planData = {
        cluster: formData.cluster,
        name: formData.planName,
        description: formData.description,
        priority: formData.priority,
        complexity: formData.complexity, // Additional metadata
      };

      // Get proper userID - firstName from contextStore for user actions
      const { contextStore } = await import("@whatsfresh/shared-imports");
      const userID = contextStore.getParameter("firstName") || "user";

      console.log("Creating plan via workflow:", planData);
      const result = await createPlan(planData, userID);

      if (result.success) {
        setSubmitResult({
          success: true,
          planId: result.paddedPlanId,
          message: result.message,
          details: result.details,
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
          message: result.message,
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
          {/* Plan Name */}
          <TextField
            label="Plan Name"
            value={formData.planName}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, planName: value }))
            }
            placeholder="e.g., User Authentication System"
          />

          {/* Plan Description - Much Wider Text Area */}
          <Box sx={{ width: "350%", maxWidth: "calc(100vw - 120px)" }}>
            <MultiLineField
              label="Plan Description"
              value={formData.description}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, description: value }))
              }
              minRows={15}
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
          </Box>
        </Grid>

        {/* Form Status */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {isFormValid ? (
              <Chip label="Ready to Create" color="success" size="small" />
            ) : (
              <Chip label="Fill Required Fields" color="default" size="small" />
            )}
          </Box>
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
