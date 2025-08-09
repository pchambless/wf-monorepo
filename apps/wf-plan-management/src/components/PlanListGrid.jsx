import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Edit, Visibility } from "@mui/icons-material";
import PlanModal from "./PlanModal";
import {
  executeGridQuery,
  executeWorkflow,
} from "../utils/eventTypeIntegration";

/**
 * Plan List Grid component
 * Uses existing grid-planList eventType and integrates with modal system
 * Tests the EventType → Workflow → Modal pattern
 */
const PlanListGrid = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("new");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Mock data for now - TODO: Connect to actual eventType/workflow system
  const mockPlans = [
    {
      id: 39,
      name: "EventType → Workflow → Modal Generic Layer",
      cluster: "DEVTOOLS",
      status: "new",
      priority: "medium",
      description:
        "Prove the marriage of eventTypes <-> workflows with modal-based generic UI layer",
      assigned_to: null,
    },
    {
      id: 38,
      name: "Plan Management UI Foundation",
      cluster: "DEVTOOLS",
      status: "completed",
      priority: "high",
      description: "Build basic plan management interface",
      assigned_to: "Paul",
    },
  ];

  // Load plans based on status filter using grid-planList eventType
  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        // Use the grid-planList eventType with :planStatus parameter
        const planData = await executeGridQuery("grid-planList", {
          planStatus: selectedStatus,
        });
        setPlans(planData);
      } catch (error) {
        console.error("Error loading plans:", error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [selectedStatus]);

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleCreatePlan = () => {
    setModalMode("create");
    setSelectedPlan(null);
    setModalOpen(true);
  };

  const handleEditPlan = (plan) => {
    setModalMode("edit");
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handleViewPlan = (plan) => {
    // TODO: Navigate to plan detail view or open read-only modal
    console.log("View plan:", plan);
  };

  const handleSavePlan = async (planData) => {
    try {
      if (modalMode === "create") {
        // Use createPlan workflow from eventType workflowTriggers
        const result = await executeWorkflow("createPlan", planData);
        if (result.success) {
          // Refresh the plan list
          const updatedPlans = await executeGridQuery("grid-planList", {
            planStatus: selectedStatus,
          });
          setPlans(updatedPlans);
        }
      } else {
        // Use updatePlan workflow from eventType workflowTriggers
        const result = await executeWorkflow("updatePlan", {
          ...planData,
          id: selectedPlan.id,
        });
        if (result.success) {
          // Refresh the plan list
          const updatedPlans = await executeGridQuery("grid-planList", {
            planStatus: selectedStatus,
          });
          setPlans(updatedPlans);
        }
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      // TODO: Show error message to user
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "primary",
      active: "success",
      completed: "default",
      "on-hold": "warning",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "default",
      medium: "primary",
      high: "warning",
      urgent: "error",
    };
    return colors[priority] || "default";
  };

  return (
    <Box>
      {/* Header with status filter and create button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Plan Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={selectedStatus}
              onChange={handleStatusChange}
              label="Status Filter"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="on-hold">On Hold</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreatePlan}
          >
            Create Plan
          </Button>
        </Box>
      </Box>

      {/* Plans table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Cluster</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No plans found for status: {selectedStatus}
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id} hover>
                  <TableCell>{plan.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {plan.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{plan.cluster}</TableCell>
                  <TableCell>
                    <Chip
                      label={plan.status}
                      color={getStatusColor(plan.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plan.priority}
                      color={getPriorityColor(plan.priority)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{plan.assigned_to || "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewPlan(plan)}
                      title="View Plan"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditPlan(plan)}
                      title="Edit Plan"
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Plan Modal */}
      <PlanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        planData={selectedPlan}
        onSave={handleSavePlan}
      />
    </Box>
  );
};

export default PlanListGrid;
