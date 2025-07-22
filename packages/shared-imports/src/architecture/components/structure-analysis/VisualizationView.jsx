/**
 * Visualization View Component
 *
 * Generates and displays Mermaid charts for architecture visualization
 */

import React, { useState } from "react";
import { Box, Typography, Paper, Chip, Alert } from "@mui/material";

const VisualizationView = ({ intel }) => {
  const [chartType, setChartType] = useState("overview");

  const chartTypes = [
    { id: "overview", name: "System Overview" },
    { id: "critical-nodes", name: "Critical Nodes" },
    { id: "cross-package", name: "Cross-Package Flow" },
    { id: "widget-system", name: "Widget System" },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Architecture Visualization
      </Typography>

      <Box sx={{ mb: 3 }}>
        {chartTypes.map((type) => (
          <Chip
            key={type.id}
            label={type.name}
            onClick={() => setChartType(type.id)}
            color={chartType === type.id ? "primary" : "default"}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>

      <Paper sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", whiteSpace: "pre-line" }}
        >
          {intel.generateMermaidChart(chartType)}
        </Typography>
      </Paper>

      <Alert severity="info" sx={{ mt: 2 }}>
        Copy the Mermaid code above and paste it into a Mermaid renderer for
        visualization.
      </Alert>
    </Box>
  );
};

export default VisualizationView;
