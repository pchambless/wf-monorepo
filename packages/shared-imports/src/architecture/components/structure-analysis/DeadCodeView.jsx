/**
 * Dead Code View Component
 *
 * Displays potential dead code candidates for cleanup
 */

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const DeadCodeView = ({ intel }) => {
  const deadCode = intel.getDeadCode();
  const safeToRemove = intel.getSafeToRemove();

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Dead code analysis is based on known patterns. Always verify before
          deletion.
        </Typography>
      </Alert>

      <Typography variant="h6" gutterBottom color="success.main">
        <CheckIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Safe to Remove ({safeToRemove.length} files)
      </Typography>

      <List>
        {safeToRemove.map((item) => (
          <ListItem key={item.file}>
            <ListItemIcon>
              <DeleteIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography sx={{ fontFamily: "monospace" }}>
                  {item.file}
                </Typography>
              }
              secondary={item.reason}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DeadCodeView;
