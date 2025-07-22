/**
 * Create Plan Form Component
 *
 * Web-based interface for creating new plans (replaces CLI create-plan.js)
 */

import React, { useState } from "react";
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
} from "@mui/material";

// Available clusters (from create-plan.js)
const CLUSTERS = {
  API: "Server-side API and backend functionality",
  CLIENT: "Client-side React components and pages",
  SHARED: "Shared components and utilities",
  DEVTOOLS: "Development tools and automation",
  REPORTS: "Reporting and PDF generation",
  LOGGING: "Logging and monitoring systems",
  EVENTS: "Event system and data flow",
};

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

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Simulate plan creation (Phase 2 implementation)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call to create-plan functionality
      const mockPlanId = `00${Math.floor(Math.random() * 90) + 10}`;

      setSubmitResult({
        success: true,
        planId: mockPlanId,
        message: `Plan ${mockPlanId} created successfully!`,
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
        {/* Cluster Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Cluster</InputLabel>
            <Select
              value={formData.cluster}
              onChange={handleInputChange("cluster")}
              label="Cluster"
            >
              {Object.entries(CLUSTERS).map(([key, description]) => (
                <MenuItem key={key} value={key}>
                  <Box>
                    <Typography variant="body1">{key}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Plan Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Plan Name"
            value={formData.planName}
            onChange={handleInputChange("planName")}
            placeholder="e.g., User Authentication System"
            helperText="Descriptive name for the plan"
          />
        </Grid>

        {/* Complexity */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Complexity</InputLabel>
            <Select
              value={formData.complexity}
              onChange={handleInputChange("complexity")}
              label="Complexity"
            >
              <MenuItem value="low">
                Low - Simple changes, minimal impact
              </MenuItem>
              <MenuItem value="medium">
                Medium - Moderate changes, some dependencies
              </MenuItem>
              <MenuItem value="high">
                High - Complex changes, significant impact
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Priority */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={handleInputChange("priority")}
              label="Priority"
            >
              <MenuItem value="low">Low - Nice to have</MenuItem>
              <MenuItem value="normal">Normal - Standard priority</MenuItem>
              <MenuItem value="high">High - Important for business</MenuItem>
              <MenuItem value="urgent">Urgent - Blocking other work</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Plan Description"
            value={formData.description}
            onChange={handleInputChange("description")}
            placeholder="Describe what this plan will accomplish, key requirements, and expected outcomes..."
            helperText="Detailed description of the plan requirements and goals"
          />
        </Grid>

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
              {isSubmitting ? "Creating..." : "Create Plan"}
            </Button>

            <Button
              variant="outlined"
              onClick={() =>
                setFormData({
                  cluster: "",
                  planName: "",
                  description: "",
                  complexity: "medium",
                  priority: "normal",
                })
              }
              disabled={isSubmitting}
            >
              Reset Form
            </Button>

            {/* Form Status */}
            <Box sx={{ ml: "auto" }}>
              {isFormValid ? (
                <Chip label="Ready to Create" color="success" size="small" />
              ) : (
                <Chip
                  label="Fill Required Fields"
                  color="default"
                  size="small"
                />
              )}
            </Box>
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
