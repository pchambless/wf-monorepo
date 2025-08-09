import React, { useState, useEffect } from "react";
import {
  executeGridQuery,
  executeWorkflow,
} from "../utils/eventTypeIntegration";

/**
 * Simple vanilla React plan list for Plan 0039 testing
 * Tests EventType → Workflow → Modal pattern without MUI dependencies
 */
const SimplePlanList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("new");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    cluster: "DEVTOOLS",
    status: "new",
    priority: "medium",
    description: "",
    comments: "",
    assigned_to: "",
  });

  const styles = {
    container: {
      padding: "20px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      margin: 0,
    },
    controls: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },
    select: {
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #ddd",
    },
    button: {
      padding: "8px 16px",
      backgroundColor: "#1976d2",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #ddd",
    },
    th: {
      backgroundColor: "#f5f5f5",
      padding: "12px",
      textAlign: "left",
      borderBottom: "1px solid #ddd",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #eee",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      width: "500px",
      maxHeight: "80vh",
      overflow: "auto",
    },
    formGroup: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #ddd",
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #ddd",
      boxSizing: "border-box",
      minHeight: "80px",
      resize: "vertical",
    },
    modalActions: {
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
      marginTop: "20px",
    },
    cancelButton: {
      padding: "8px 16px",
      backgroundColor: "#666",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
  };

  // Load plans based on status filter
  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
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
    setFormData({
      name: "",
      cluster: "DEVTOOLS",
      status: "new",
      priority: "medium",
      description: "",
      comments: "",
      assigned_to: "",
    });
    setModalOpen(true);
  };

  const handleEditPlan = (plan) => {
    setModalMode("edit");
    setSelectedPlan(plan);
    setFormData({
      name: plan.name || "",
      cluster: plan.cluster || "DEVTOOLS",
      status: plan.status || "new",
      priority: plan.priority || "medium",
      description: plan.description || "",
      comments: plan.comments || "",
      assigned_to: plan.assigned_to || "",
    });
    setModalOpen(true);
  };

  const handleSavePlan = async () => {
    try {
      if (modalMode === "create") {
        const result = await executeWorkflow("createPlan", formData);
        if (result.success) {
          const updatedPlans = await executeGridQuery("grid-planList", {
            planStatus: selectedStatus,
          });
          setPlans(updatedPlans);
        }
      } else {
        const result = await executeWorkflow("updatePlan", {
          ...formData,
          id: selectedPlan.id,
        });
        if (result.success) {
          const updatedPlans = await executeGridQuery("grid-planList", {
            planStatus: selectedStatus,
          });
          setPlans(updatedPlans);
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Plan Management</h1>
        <div style={styles.controls}>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            style={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
          <button onClick={handleCreatePlan} style={styles.button}>
            Create Plan
          </button>
        </div>
      </div>

      {/* Plans Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Cluster</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Priority</th>
            <th style={styles.th}>Assigned To</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" style={{ ...styles.td, textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : plans.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ ...styles.td, textAlign: "center" }}>
                No plans found for status: {selectedStatus}
              </td>
            </tr>
          ) : (
            plans.map((plan) => (
              <tr key={plan.id}>
                <td style={styles.td}>{plan.id}</td>
                <td style={styles.td}>{plan.name}</td>
                <td style={styles.td}>{plan.cluster}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        plan.status === "new"
                          ? "#e3f2fd"
                          : plan.status === "active"
                          ? "#e8f5e8"
                          : plan.status === "completed"
                          ? "#f5f5f5"
                          : "#fff3e0",
                      fontSize: "12px",
                    }}
                  >
                    {plan.status}
                  </span>
                </td>
                <td style={styles.td}>{plan.priority}</td>
                <td style={styles.td}>{plan.assigned_to || "-"}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEditPlan(plan)}
                    style={{
                      ...styles.button,
                      fontSize: "12px",
                      padding: "4px 8px",
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalOpen && (
        <div style={styles.modal} onClick={() => setModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{modalMode === "create" ? "Create New Plan" : "Edit Plan"}</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Plan Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Cluster</label>
              <select
                value={formData.cluster}
                onChange={(e) => handleInputChange("cluster", e.target.value)}
                style={styles.input}
              >
                <option value="DEVTOOLS">DEVTOOLS</option>
                <option value="PLANS">PLANS</option>
                <option value="ADMIN">ADMIN</option>
                <option value="CLIENT">CLIENT</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                style={styles.input}
              >
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                style={styles.input}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                style={styles.textarea}
                rows={4}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Comments</label>
              <textarea
                value={formData.comments}
                onChange={(e) => handleInputChange("comments", e.target.value)}
                style={styles.textarea}
                rows={2}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Assigned To</label>
              <input
                type="text"
                value={formData.assigned_to}
                onChange={(e) =>
                  handleInputChange("assigned_to", e.target.value)
                }
                style={styles.input}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setModalOpen(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button onClick={handleSavePlan} style={styles.button}>
                {modalMode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplePlanList;
