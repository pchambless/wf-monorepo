import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

/**
 * Generic modal component for plan CRUD operations
 * Tests the EventType → Workflow → Modal integration pattern
 */
const PlanModal = ({
  open,
  onClose,
  mode = "create", // 'create' or 'edit'
  planData = null,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    cluster: "DEVTOOLS",
    status: "new",
    priority: "medium",
    description: "",
    comments: "",
    assigned_to: "",
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (mode === "edit" && planData) {
      setFormData({
        name: planData.name || "",
        cluster: planData.cluster || "DEVTOOLS",
        status: planData.status || "new",
        priority: planData.priority || "medium",
        description: planData.description || "",
        comments: planData.comments || "",
        assigned_to: planData.assigned_to || "",
      });
    } else if (mode === "create") {
      // Reset form for create mode
      setFormData({
        name: "",
        cluster: "DEVTOOLS",
        status: "new",
        priority: "medium",
        description: "",
        comments: "",
        assigned_to: "",
      });
    }
  }, [mode, planData, open]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    // TODO: Connect to workflow system
    // For now, just pass data back to parent
    onSave(formData);
    onClose();
  };

  const title = mode === "create" ? "Create New Plan" : "Edit Plan";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Plan Name"
            value={formData.name}
            onChange={handleChange("name")}
            fullWidth
            required
          />

          <FormControl fullWidth>
            <InputLabel>Cluster</InputLabel>
            <Select
              value={formData.cluster}
              onChange={handleChange("cluster")}
              label="Cluster"
            >
              <MenuItem value="DEVTOOLS">DEVTOOLS</MenuItem>
              <MenuItem value="PLANS">PLANS</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="CLIENT">CLIENT</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={handleChange("status")}
              label="Status"
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="on-hold">On Hold</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={handleChange("priority")}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange("description")}
            multiline
            rows={4}
            fullWidth
          />

          <TextField
            label="Comments"
            value={formData.comments}
            onChange={handleChange("comments")}
            multiline
            rows={2}
            fullWidth
          />

          <TextField
            label="Assigned To"
            value={formData.assigned_to}
            onChange={handleChange("assigned_to")}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanModal;
