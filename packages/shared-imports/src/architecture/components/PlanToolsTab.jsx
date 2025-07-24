/**
 * Plan Tools Tab
 *
 * Web-based interface for plan creation and management
 * Replaces CLI tools with user-friendly forms
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Alert,
} from "@mui/material";

// Import plan tool components
import CreatePlanForm from "./plan-tools/CreatePlanForm.jsx";
import CompletePlanForm from "./plan-tools/CompletePlanForm.jsx";
import ImpactTrackingEditor from "./plan-tools/ImpactTrackingEditor.jsx";

const PlanToolsTab = () => {
  const [selectedTool, setSelectedTool] = useState("create-plan");

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Plan Management Tools
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Web-based interface for plan creation and management (no CLI required)
      </Alert>

      {/* Tool Selection */}
      <Box sx={{ mb: 3 }}>
        <Chip
          label="Create Plan"
          color="primary"
          variant={selectedTool === "create-plan" ? "filled" : "outlined"}
          onClick={() => setSelectedTool("create-plan")}
          sx={{ mr: 1, mb: 1 }}
        />
        <Chip
          label="Complete Plan"
          color="success"
          variant={selectedTool === "complete-plan" ? "filled" : "outlined"}
          onClick={() => setSelectedTool("complete-plan")}
          sx={{ mr: 1, mb: 1 }}
        />
        <Chip
          label="Impact Tracking"
          color="warning"
          variant={selectedTool === "impact-tracking" ? "filled" : "outlined"}
          onClick={() => setSelectedTool("impact-tracking")}
          sx={{ mr: 1, mb: 1 }}
        />
      </Box>

      {/* Tool Interface */}
      <Card>
        <CardHeader
          title={
            selectedTool === "create-plan"
              ? "Create New Plan"
              : selectedTool === "complete-plan"
              ? "Complete Plan"
              : "Impact Tracking Editor"
          }
          action={
            selectedTool !== "impact-tracking" && (
              <Chip
                label="Reset Form"
                variant="outlined"
                size="small"
                onClick={() => {
                  // This will trigger a reset in the child components
                  // We'll need to pass a reset function down
                  window.dispatchEvent(
                    new CustomEvent("resetForm", {
                      detail: { tool: selectedTool },
                    })
                  );
                }}
                sx={{ cursor: "pointer" }}
              />
            )
          }
        />
        <CardContent>
          {/* Create Plan Tool */}
          {selectedTool === "create-plan" && <CreatePlanForm />}

          {/* Complete Plan Tool */}
          {selectedTool === "complete-plan" && <CompletePlanForm />}

          {/* Impact Tracking Tool */}
          {selectedTool === "impact-tracking" && <ImpactTrackingEditor />}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlanToolsTab;
