/**
 * Impact Tracking Editor Component
 *
 * Web-based interface for viewing and editing impact tracking data
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
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

// Import our form components
import { TextField } from "@whatsfresh/shared-imports/jsx";
import { usePlanContext } from "../../../contexts/PlanContext.jsx";

// Import workflow registry for impact tracking operations
import { workflowRegistry } from "../../workflows/WorkflowRegistry.js";

// Import workflow configuration
import { getComponentWorkflowConfig } from "../../config/workflowConfig.js";

// Impact data loaded from database via planImpactList eventType

const ImpactTrackingEditor = () => {
  const [impactData, setImpactData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterPlan, setFilterPlan] = useState("");

  // Use plan context for automatic refresh when plan changes
  const { currentPlanId, isRefreshing } = usePlanContext(async (planId) => {
    await loadImpactData(planId);
  });

  // Load impact data using workflow
  const loadImpactData = async (planId) => {
    if (!planId) {
      setImpactData([]);
      return;
    }

    setLoading(true);
    try {
      // Use impact tracking workflow to load data
      const workflowContext = {
        planId,
        action: "load",
      };

      const workflowOptions = getComponentWorkflowConfig("editor");
      const result = await workflowRegistry.execute(
        "trackImpact",
        workflowContext,
        workflowOptions
      );

      if (result && result.success && Array.isArray(result.data.impacts)) {
        setImpactData(result.data.impacts);
      } else {
        setImpactData([]);
      }
    } catch (error) {
      console.error("Error loading impact data:", error);
      setImpactData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load when component mounts
  useEffect(() => {
    if (currentPlanId) {
      loadImpactData(currentPlanId);
    }
  }, [currentPlanId]);

  const handleEdit = (impact) => {
    setEditingId(impact.impact_id);
    setEditForm({ ...impact });
  };

  const handleSave = async () => {
    try {
      // Use impact tracking workflow to update data
      const workflowContext = {
        action: "update",
        impactId: editingId,
        filePath: editForm.file_path || editForm.file,
        description: editForm.description,
        updatedBy: "user",
      };

      console.log(
        "Executing trackImpact workflow for update:",
        workflowContext
      );
      const workflowOptions = getComponentWorkflowConfig("editor");
      const result = await workflowRegistry.execute(
        "trackImpact",
        workflowContext,
        workflowOptions
      );

      if (result && result.success) {
        // Update local state with the changes
        setImpactData((prev) =>
          prev.map((item) =>
            item.impact_id === editingId ? { ...editForm } : item
          )
        );
        setEditingId(null);
        setEditForm({});
      } else {
        console.error("Failed to update impact:", result?.error);
        alert(
          `Failed to save changes: ${
            result?.error?.message || "Workflow execution failed"
          }`
        );
      }
    } catch (error) {
      console.error("Error saving impact:", error);
      alert(`Error saving changes: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleFormChange = (field) => (event) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const filteredData = filterPlan
    ? impactData.filter((item) => item.plan_id.includes(filterPlan))
    : impactData;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      case "blocked":
        return "error";
      default:
        return "default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "CREATED":
        return "success";
      case "MODIFIED":
        return "warning";
      case "DELETED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Impact tracking editor - view and modify file-level impact data for all
        plans
        {isRefreshing && " (Refreshing...)"}
      </Alert>

      {!currentPlanId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please select a plan to view impact tracking data
        </Alert>
      )}

      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filter & Search" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Filter by Plan"
                value={filterPlan}
                onChange={(value) => setFilterPlan(value)}
                placeholder="All Plans"
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Showing {filteredData.length} of {impactData.length} impacts
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFilterPlan("")}
                  disabled={!filterPlan}
                >
                  Clear Filter
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Impact Data Table */}
      <Card>
        <CardHeader title="Impact Tracking Data" />
        <CardContent>
          <TableContainer component={Paper}>
            <Table size="small" sx={{ "& .MuiTableCell-root": { py: 0.5 } }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>File</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((impact) => (
                  <TableRow key={impact.impact_id}>
                    <TableCell>{impact.impact_id}</TableCell>
                    <TableCell>
                      <Chip label={impact.plan_id} size="small" />
                    </TableCell>
                    <TableCell>
                      {editingId === impact.impact_id ? (
                        <input
                          type="text"
                          value={editForm.file || ""}
                          onChange={handleFormChange("file")}
                          style={{
                            minWidth: 200,
                            padding: "4px",
                            fontSize: "0.875rem",
                          }}
                        />
                      ) : (
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {impact.file.split("/").pop()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {impact.package}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={impact.type}
                        size="small"
                        color={getTypeColor(impact.type)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={impact.status}
                        size="small"
                        color={getStatusColor(impact.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {editingId === impact.impact_id ? (
                        <textarea
                          rows={2}
                          value={editForm.description || ""}
                          onChange={handleFormChange("description")}
                          style={{
                            minWidth: 250,
                            padding: "4px",
                            fontSize: "0.875rem",
                            fontFamily: "inherit",
                            resize: "vertical",
                          }}
                        />
                      ) : (
                        <Typography variant="body2">
                          {impact.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === impact.impact_id ? (
                        <Box>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={handleSave}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={handleCancel}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(impact)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImpactTrackingEditor;
