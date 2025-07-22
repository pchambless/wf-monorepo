/**
 * Impact Tracking Editor Component
 *
 * Web-based interface for viewing and editing impact tracking data
 */

import React, { useState } from "react";
import {
  Grid,
  TextField,
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

// Mock impact tracking data (would come from impact-tracking.json in real implementation)
const MOCK_IMPACT_DATA = [
  {
    impact_id: 52,
    plan_id: "0011",
    package: "shared-imports",
    file: "packages/shared-imports/src/components/crud/Form/stores/FormStore.js",
    type: "MODIFIED",
    status: "completed",
    description: "Enhanced FormStore to include contextStore parameters",
    complexity: "medium",
    cluster: "API",
  },
  {
    impact_id: 53,
    plan_id: "0011",
    package: "wf-server",
    file: "apps/wf-server/server/utils/dml/sqlBuilder.js",
    type: "MODIFIED",
    status: "completed",
    description: "Fixed primary key exclusion in INSERT operations",
    complexity: "low",
    cluster: "API",
  },
  {
    impact_id: 54,
    plan_id: "0015",
    package: "shared-imports",
    file: "packages/shared-imports/src/architecture/intelligence.js",
    type: "CREATED",
    status: "completed",
    description: "Architectural intelligence system implementation",
    complexity: "high",
    cluster: "DEVTOOLS",
  },
];

const ImpactTrackingEditor = () => {
  const [impactData, setImpactData] = useState(MOCK_IMPACT_DATA);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filterPlan, setFilterPlan] = useState("");

  const handleEdit = (impact) => {
    setEditingId(impact.impact_id);
    setEditForm({ ...impact });
  };

  const handleSave = () => {
    setImpactData((prev) =>
      prev.map((item) =>
        item.impact_id === editingId ? { ...editForm } : item
      )
    );
    setEditingId(null);
    setEditForm({});
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
      </Alert>

      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filter & Search" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Filter by Plan ID"
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                placeholder="e.g., 0011"
                helperText="Enter plan ID to filter impacts"
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
            <Table>
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
                        <TextField
                          size="small"
                          value={editForm.file || ""}
                          onChange={handleFormChange("file")}
                          sx={{ minWidth: 200 }}
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
                        <TextField
                          size="small"
                          multiline
                          rows={2}
                          value={editForm.description || ""}
                          onChange={handleFormChange("description")}
                          sx={{ minWidth: 250 }}
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
