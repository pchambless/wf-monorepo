/**
 * User Communication Form Component
 *
 * Strategic input interface for User → Claude ↔ Kiro collaboration
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
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

// Communication types for strategic input
const COMMUNICATION_TYPES = {
  "strategic-input": {
    label: "Strategic Input",
    description: "Provide business context and strategic direction",
    color: "primary",
    icon: "🎯",
  },
  "priority-change": {
    label: "Priority Change",
    description: "Modify plan priorities or urgency levels",
    color: "warning",
    icon: "⚡",
  },
  "scope-modification": {
    label: "Scope Modification",
    description: "Adjust plan scope or requirements",
    color: "info",
    icon: "📋",
  },
  "architectural-guidance": {
    label: "Architectural Guidance",
    description: "Provide technical direction or constraints",
    color: "secondary",
    icon: "🏗️",
  },
  "business-requirement": {
    label: "Business Requirement",
    description: "New business needs or constraints",
    color: "success",
    icon: "💼",
  },
};

// Priority levels for communications
const PRIORITY_LEVELS = [
  { value: "low", label: "Low - FYI/Nice to have", color: "default" },
  { value: "normal", label: "Normal - Standard input", color: "primary" },
  { value: "high", label: "High - Important for business", color: "warning" },
  { value: "urgent", label: "Urgent - Blocking decisions", color: "error" },
];

const UserCommunicationForm = () => {
  const [formData, setFormData] = useState({
    type: "strategic-input",
    priority: "normal",
    subject: "",
    message: "",
    affectedPlans: "",
    requiresResponse: false,
    businessImpact: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleInputChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Simulate communication submission (Phase 3 implementation)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual coordination system integration
      const communicationId = `user-${Date.now()}`;

      setSubmitResult({
        success: true,
        message: `Strategic communication submitted successfully! (ID: ${communicationId})`,
        details:
          "Your input has been added to the coordination system and will be reviewed by Claude and Kiro.",
      });

      // Reset form
      setFormData({
        type: "strategic-input",
        priority: "normal",
        subject: "",
        message: "",
        affectedPlans: "",
        requiresResponse: false,
        businessImpact: "medium",
      });
    } catch (error) {
      setSubmitResult({
        success: false,
        message: `Failed to submit communication: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.subject && formData.message;
  const selectedType = COMMUNICATION_TYPES[formData.type];

  return (
    <Box>
      {submitResult && (
        <Alert
          severity={submitResult.success ? "success" : "error"}
          sx={{ mb: 3 }}
          onClose={() => setSubmitResult(null)}
        >
          <Typography variant="body2" gutterBottom>
            {submitResult.message}
          </Typography>
          {submitResult.details && (
            <Typography variant="caption">{submitResult.details}</Typography>
          )}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Communication Type */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Communication Type</InputLabel>
            <Select
              value={formData.type}
              onChange={handleInputChange("type")}
              label="Communication Type"
            >
              {Object.entries(COMMUNICATION_TYPES).map(([key, type]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ mr: 1 }}>{type.icon}</Typography>
                    <Box>
                      <Typography variant="body1">{type.label}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Priority Level */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Priority Level</InputLabel>
            <Select
              value={formData.priority}
              onChange={handleInputChange("priority")}
              label="Priority Level"
            >
              {PRIORITY_LEVELS.map((priority) => (
                <MenuItem key={priority.value} value={priority.value}>
                  <Typography variant="body1">{priority.label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Subject */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Subject"
            value={formData.subject}
            onChange={handleInputChange("subject")}
            placeholder="Brief summary of your strategic input..."
            helperText="Clear, concise subject line for your communication"
          />
        </Grid>

        {/* Message */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Strategic Message"
            value={formData.message}
            onChange={handleInputChange("message")}
            placeholder="Provide detailed strategic input, business context, requirements, or guidance for the AI collaboration team..."
            helperText="Detailed message with context, requirements, and any specific guidance"
          />
        </Grid>

        {/* Affected Plans */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Affected Plans (Optional)"
            value={formData.affectedPlans}
            onChange={handleInputChange("affectedPlans")}
            placeholder="e.g., 0011, 0015, 0016"
            helperText="Plan IDs that this communication relates to"
          />
        </Grid>

        {/* Business Impact */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Business Impact</InputLabel>
            <Select
              value={formData.businessImpact}
              onChange={handleInputChange("businessImpact")}
              label="Business Impact"
            >
              <MenuItem value="low">Low - Minor business effect</MenuItem>
              <MenuItem value="medium">
                Medium - Moderate business impact
              </MenuItem>
              <MenuItem value="high">
                High - Significant business impact
              </MenuItem>
              <MenuItem value="critical">
                Critical - Major business impact
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Options */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.requiresResponse}
                onChange={handleInputChange("requiresResponse")}
              />
            }
            label="Requires Response - I need feedback or acknowledgment on this communication"
          />
        </Grid>

        {/* Communication Preview */}
        {isFormValid && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Communication Preview
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={selectedType.label}
                    color={selectedType.color}
                    size="small"
                  />
                  <Chip
                    label={formData.priority.toUpperCase()}
                    color={
                      PRIORITY_LEVELS.find((p) => p.value === formData.priority)
                        ?.color || "default"
                    }
                    size="small"
                  />
                  <Chip
                    label={`${formData.businessImpact.toUpperCase()} Impact`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Subject:</strong> {formData.subject}
                </Typography>
                <Typography variant="body2">
                  <strong>Message:</strong> {formData.message.substring(0, 200)}
                  {formData.message.length > 200 && "..."}
                </Typography>
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
              sx={{ minWidth: 140 }}
            >
              {isSubmitting ? "Submitting..." : "Send Communication"}
            </Button>

            <Button
              variant="outlined"
              onClick={() =>
                setFormData({
                  type: "strategic-input",
                  priority: "normal",
                  subject: "",
                  message: "",
                  affectedPlans: "",
                  requiresResponse: false,
                  businessImpact: "medium",
                })
              }
              disabled={isSubmitting}
            >
              Reset Form
            </Button>

            {/* Form Status */}
            <Box sx={{ ml: "auto" }}>
              {isFormValid ? (
                <Chip label="Ready to Send" color="success" size="small" />
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
      </Grid>
    </Box>
  );
};

export default UserCommunicationForm;
