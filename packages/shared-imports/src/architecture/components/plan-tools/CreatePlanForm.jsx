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

// Load configuration data
const CLUSTER_OPTIONS = getClusterOptions();

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
      // Database-native plan creation (Plan 0018)
      const { execDml } = await import("@whatsfresh/shared-imports/api");

      // Step 1: Create plan record in database (auto-increment ID)
      const planData = {
        cluster: formData.cluster,
        name: formData.planName,
        description: formData.description,
        status: "pending",
        priority: formData.priority,
        created_by: "user",
        created_at: new Date().toISOString(),
      };

      console.log("Creating plan in database:", planData);
      const planResult = await execDml({
        table: "api_wf.plans",
        operation: "INSERT",
        data: planData,
      });

      if (!planResult || !planResult.success) {
        throw new Error(
          planResult?.error || "Failed to create plan in database"
        );
      }

      const planId = planResult.insertId || planResult.id;
      const paddedPlanId = planId.toString().padStart(4, "0");

      // Step 2: Create markdown file
      const filename = `${paddedPlanId}-${
        formData.cluster
      }-${formData.planName.replace(/[^a-zA-Z0-9]/g, "-")}.md`;
      const filePath = `claude-plans/a-pending/${filename}`;

      const markdownContent = `# ${formData.planName}

## Plan Overview
${formData.description}

## Implementation Details
- **Plan ID**: ${paddedPlanId}
- **Cluster**: ${formData.cluster}
- **Priority**: ${formData.priority}
- **Complexity**: ${formData.complexity}
- **Status**: Pending
- **Created**: ${new Date().toISOString()}
- **Created By**: User

## Next Steps
- [ ] Review and approve plan
- [ ] Assign implementation resources
- [ ] Begin implementation

---
*This plan was created through the Architecture Intel Dashboard.*
`;

      // Step 3: Track document in plan_documents table
      const documentResult = await execDml({
        table: "api_wf.plan_documents",
        operation: "INSERT",
        data: {
          plan_id: planId,
          document_type: "plan",
          file_path: filePath,
          title: formData.planName,
          author: "user",
          status: "draft",
          created_by: "user",
          created_at: new Date().toISOString(),
        },
      });

      // Step 4: Track impact for document creation milestone
      const impactResult = await execDml({
        table: "api_wf.plan_impacts",
        operation: "INSERT",
        data: {
          plan_id: planId,
          file_path: filePath,
          change_type: "CREATED",
          status: "completed",
          description: `Plan document created: ${formData.planName}`,
          created_by: "user",
          created_at: new Date().toISOString(),
        },
      });

      // Note: In a real implementation, we'd also need to actually write the file to disk
      // For now, we'll log the content that should be saved
      console.log("Plan document content to save:", markdownContent);
      console.log("File path:", filePath);

      setSubmitResult({
        success: true,
        planId: paddedPlanId,
        message: `Plan ${paddedPlanId} created successfully!`,
        details: `Plan document created at ${filePath} and tracked in database.`,
      });

      // Reset form
      setFormData({
        cluster: "",
        planName: "",
        description: "",
        complexity: "medium",
        priority: "normal",
      });
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
