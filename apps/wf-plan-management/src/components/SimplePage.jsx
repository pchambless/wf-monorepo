import React from "react";

/**
 * Simple page template for Plan 0039 - avoids MUI dependencies
 */
const SimplePage = ({ title, description, note }) => {
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
    note: { color: "#666", fontSize: "14px", marginTop: "10px" },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.card}>
        <p>{description}</p>
        {note && <p style={styles.note}>{note}</p>}
      </div>
    </div>
  );
};

export default SimplePage;
