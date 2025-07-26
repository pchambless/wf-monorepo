/**
 * Critical Nodes View Component
 *
 * Displays files with highest dependency counts and impact analysis
 */

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

// Helper function to extract package name from file path
const getPackageFromPath = (filePath) => {
  if (filePath.startsWith("apps/wf-client")) {
    return "wf-client";
  }
  if (filePath.startsWith("apps/wf-admin")) {
    return "wf-admin";
  }
  if (filePath.startsWith("apps/wf-server")) {
    return "wf-server";
  }
  if (filePath.startsWith("packages/shared-imports")) {
    return "shared-imports";
  }
  if (filePath.startsWith("packages/devtools")) {
    return "devtools";
  }
  return "unknown";
};

const CriticalNodesView = ({ intel }) => {
  const criticalNodes = intel.getCriticalNodes();
  const highImpactNodes = intel.getHighImpactNodes();

  return (
    <Box>
      <Typography variant="h6" gutterBottom color="error">
        <ErrorIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Critical Nodes (8+ dependents)
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell align="right">Dependents</TableCell>
              <TableCell>Package</TableCell>
              <TableCell>Risk Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {criticalNodes.map((node) => (
              <TableRow key={node.file}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {node.file.split("/").pop()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {node.file}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip label={node.count} color="error" size="small" />
                </TableCell>
                <TableCell>{getPackageFromPath(node.file)}</TableCell>
                <TableCell>
                  <Chip
                    label="CRITICAL"
                    color="error"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom color="warning.main">
        <WarningIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        High Impact Nodes (4-7 dependents)
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell align="right">Dependents</TableCell>
              <TableCell>Package</TableCell>
              <TableCell>Risk Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {highImpactNodes.map((node) => (
              <TableRow key={node.file}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {node.file.split("/").pop()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {node.file}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip label={node.count} color="warning" size="small" />
                </TableCell>
                <TableCell>{getPackageFromPath(node.file)}</TableCell>
                <TableCell>
                  <Chip
                    label="HIGH"
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CriticalNodesView;
