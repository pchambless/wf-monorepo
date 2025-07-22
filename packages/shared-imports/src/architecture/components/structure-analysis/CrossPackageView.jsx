/**
 * Cross-Package Dependencies View Component
 *
 * Displays dependencies that cross package boundaries
 */

import React from "react";
import {
  Box,
  Grid,
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

const CrossPackageView = ({ intel }) => {
  const crossPackageDeps = intel.getCrossPackageDependencies();
  const packageConnections = intel.getPackageConnections();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Package Connection Summary
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(packageConnections).map(([connection, count]) => (
          <Grid item key={connection}>
            <Chip
              label={`${connection}: ${count}`}
              variant="outlined"
              size="small"
            />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" gutterBottom>
        Cross-Package Dependencies (Sample)
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>From Package</TableCell>
              <TableCell>To Package</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {crossPackageDeps.slice(0, 15).map((dep, index) => (
              <TableRow key={index}>
                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {dep.from.split("/").pop()}
                </TableCell>
                <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {dep.to.split("/").pop()}
                </TableCell>
                <TableCell>
                  <Chip label={dep.fromPackageName} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={dep.toPackageName} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {crossPackageDeps.length > 15 && (
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 1, display: "block" }}
        >
          Showing first 15 of {crossPackageDeps.length} cross-package
          dependencies
        </Typography>
      )}
    </Box>
  );
};

export default CrossPackageView;
