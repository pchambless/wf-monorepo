import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data - TODO: Connect to actual eventTypes
  const planStats = {
    new: 2,
    active: 5,
    completed: 12,
    onHold: 1,
  };

  const recentPlans = [
    {
      id: 39,
      name: "EventType → Workflow → Modal Generic Layer",
      status: "new",
    },
    { id: 38, name: "Plan Management UI Foundation", status: "completed" },
    { id: 37, name: "Authentication System Upgrade", status: "active" },
  ];

  const getStatusColor = (status) => {
    const colors = {
      new: "#1976d2",
      active: "#2e7d32",
      completed: "#666",
      "on-hold": "#ed6c02",
    };
    return colors[status] || "#666";
  };

  const styles = {
    container: {
      padding: "20px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
      marginBottom: "20px",
    },
    card: {
      backgroundColor: "white",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "15px",
    },
    planItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
      padding: "8px 0",
      borderBottom: "1px solid #eee",
    },
    statusChip: {
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "bold",
      color: "white",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "15px",
    },
    statItem: {
      textAlign: "center",
    },
    statNumber: {
      fontSize: "32px",
      fontWeight: "bold",
      marginBottom: "5px",
    },
    statLabel: {
      fontSize: "14px",
      color: "#666",
    },
    actionsContainer: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    button: {
      padding: "10px 20px",
      backgroundColor: "#1976d2",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
    buttonOutlined: {
      padding: "10px 20px",
      backgroundColor: "transparent",
      color: "#1976d2",
      border: "1px solid #1976d2",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Plan Management Dashboard</h1>

      <div style={styles.grid}>
        {/* Recent Plans */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Recent Plans</h2>
          <div>
            {recentPlans.map((plan) => (
              <div key={plan.id} style={styles.planItem}>
                <span>
                  {plan.id} - {plan.name}
                </span>
                <span
                  style={{
                    ...styles.statusChip,
                    backgroundColor: getStatusColor(plan.status),
                  }}
                >
                  {plan.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Status Summary */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Plan Status Summary</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, color: "#1976d2" }}>
                {planStats.new}
              </div>
              <div style={styles.statLabel}>New</div>
            </div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, color: "#2e7d32" }}>
                {planStats.active}
              </div>
              <div style={styles.statLabel}>Active</div>
            </div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, color: "#666" }}>
                {planStats.completed}
              </div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, color: "#ed6c02" }}>
                {planStats.onHold}
              </div>
              <div style={styles.statLabel}>On Hold</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Quick Actions</h2>
        <div style={styles.actionsContainer}>
          <button
            style={styles.button}
            onClick={() => navigate("/create-plan")}
          >
            + Create New Plan
          </button>
          <button
            style={styles.buttonOutlined}
            onClick={() => navigate("/plans")}
          >
            📋 View All Plans
          </button>
          <button
            style={styles.buttonOutlined}
            onClick={() => navigate("/reports")}
          >
            📊 Generate Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
