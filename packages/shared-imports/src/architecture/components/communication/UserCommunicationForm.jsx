/**
 * User Communication Form Component
 *
 * Strategic input interface for User → Claude ↔ Kiro collaboration
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

// Import config data
import {
  getPriorityOptions,
  getCommunicationTypeOptions,
} from "../../../utils/configLoader.js";

// Import workflow functions
import { createCommunication } from "../../workflows/index.js";

// Create agent response communication
const createAgentResponse = async (originalPlanId, toAgent, type, subject, message) => {
  return await createCommunication(
    originalPlanId,
    type,
    subject, 
    message,
    "claude" // from_agent
  );
};

// Load configuration data with safety checks
const PRIORITY_LEVELS = getPriorityOptions() || [];
const COMMUNICATION_TYPES = getCommunicationTypeOptions() || [];

const UserCommunicationForm = ({ selectedPlan }) => {
  const [formData, setFormData] = useState({
    type: "strategic-input",
    priority: "normal",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Listen for reset events from the header button
  useEffect(() => {
    const handleReset = (event) => {
      if (event.detail.tool === "communication") {
        setFormData({
          type: "strategic-input",
          priority: "normal",
          subject: "",
          message: "",
        });
        setSubmitResult(null);
      }
    };

    window.addEventListener("resetForm", handleReset);
    return () => window.removeEventListener("resetForm", handleReset);
  }, []);

  const handleSubmit = async () => {
    console.log("🚀 handleSubmit called");
    console.log("📋 Form data:", formData);
    console.log("🎯 Selected plan:", selectedPlan);
    console.log("✅ Form valid:", formData.subject && formData.message && selectedPlan);
    
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Get userID from contextStore for audit trail
      const { contextStore } = await import("@whatsfresh/shared-imports");
      const userID = contextStore.getParameter("firstName") || "user";

      // Call actual communication workflow
      console.log("📞 Calling createCommunication with planId:", selectedPlan);
      const result = await createCommunication(
        selectedPlan,
        formData.type,
        formData.subject,
        formData.message,
        userID
      );

      if (result.success) {
        setSubmitResult({
          success: true,
          message: `Communication ${result.paddedCommunicationId} created successfully!`,
          details: `Sent to ${result.recipient}. ${result.details.description}`,
        });
      } else {
        throw new Error(result.message);
      }

      // Reset form
      setFormData({
        type: "strategic-input",
        priority: "normal",
        subject: "",
        message: "",
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

  const isFormValid = formData.subject && formData.message && selectedPlan;
  const selectedType = COMMUNICATION_TYPES.find(
    (type) => type.value === formData.type
  );

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
        {/* Left Column - Quick Controls */}
        <Grid item xs={12} md={4}>
          {/* Plan context provided by parent dashboard */}
          {selectedPlan && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Working with Plan: {selectedPlan}
            </Alert>
          )}

          {/* Priority Level */}
          <Select
            label="Priority Level"
            value={formData.priority}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, priority: value }))
            }
            options={PRIORITY_LEVELS}
          />

          {/* Communication Type */}
          <Select
            label="Communication Type"
            value={formData.type}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
            options={COMMUNICATION_TYPES}
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
            {isSubmitting ? "Submitting..." : "Send Communication"}
          </Button>
        </Grid>

        {/* Right Column - Content Area (Much Wider) */}
        <Grid item xs={12} md={8}>
          {/* Subject */}
          <TextField
            label="Subject"
            value={formData.subject}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, subject: value }))
            }
            placeholder="Brief summary of your strategic input..."
          />

          {/* Strategic Message - Much Wider Text Area */}
          <Box sx={{ width: "350%", maxWidth: "calc(100vw - 120px)" }}>
            <MultiLineField
              label="Strategic Message"
              value={formData.message}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, message: value }))
              }
              minRows={15}
              placeholder={`Provide detailed strategic input, business context, requirements, or guidance for the AI collaboration team...

# Strategic Context
[Describe the business context and strategic importance]

## Requirements
- Requirement 1
- Requirement 2

## Expected Outcomes
[What should this accomplish...]

## Additional Notes
[Any other relevant information...]`}
            />
          </Box>
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

        {/* Form Status */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {isFormValid ? (
              <Chip label="Ready to Send" color="success" size="small" />
            ) : (
              <Chip label="Fill Required Fields" color="default" size="small" />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserCommunicationForm;
