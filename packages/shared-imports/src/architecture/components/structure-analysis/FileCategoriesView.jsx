/**
 * File Categories View Component
 *
 * Displays files organized by impact categories with filtering
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { Settings as ConfigIcon } from "@mui/icons-material";

// Helper function to extract package name from file path
const getPackageFromPath = (filePath) => {
  if (filePath.startsWith("apps/wf-client")) return "wf-client";
  if (filePath.startsWith("apps/wf-admin")) return "wf-admin";
  if (filePath.startsWith("apps/wf-server")) return "wf-server";
  if (filePath.startsWith("packages/shared-imports")) return "shared-imports";
  if (filePath.startsWith("packages/devtools")) return "devtools";
  return "unknown";
};

const FileCategoriesView = ({
  intel,
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const categoryFiles = intel.getFilesByCategory(selectedCategory);
  const categorySummary = intel.generateSummaryReport().categories;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            <ConfigIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Categories
          </Typography>

          <List>
            {Object.entries(categories).map(([id, category]) => {
              const count =
                categorySummary.find((c) => c.id === parseInt(id))?.count || 0;
              return (
                <ListItem
                  key={id}
                  button
                  selected={selectedCategory === parseInt(id)}
                  onClick={() => onCategoryChange(parseInt(id))}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: category.color,
                        borderRadius: 1,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={category.name}
                    secondary={`${count} files - ${category.description}`}
                  />
                </ListItem>
              );
            })}
          </List>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            {categories[selectedCategory]?.name} Files
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell align="right">Dependents</TableCell>
                  <TableCell>Package</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryFiles.slice(0, 20).map((file) => (
                  <TableRow key={file.file}>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {file.file.split("/").pop()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {file.file}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={file.count}
                        size="small"
                        color={
                          file.count >= 8
                            ? "error"
                            : file.count >= 4
                            ? "warning"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>{getPackageFromPath(file.file)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {categoryFiles.length > 20 && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mt: 1, display: "block" }}
            >
              Showing first 20 of {categoryFiles.length} files
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FileCategoriesView;
