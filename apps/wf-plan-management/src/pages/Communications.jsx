import React from "react";

const Communications = () => {
  const styles = {
    container: { padding: "20px" },
    title: { fontSize: "24px", fontWeight: "bold", marginBottom: "20px" },
    card: {
      backgroundColor: "white",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Plan Communications</h1>
      <div style={styles.card}>
        <p>This page will show plan communications and messaging.</p>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Phase 3 will integrate with grid-planCommunicationList eventType.
        </p>
      </div>
    </div>
  );
};

export default Communications;
