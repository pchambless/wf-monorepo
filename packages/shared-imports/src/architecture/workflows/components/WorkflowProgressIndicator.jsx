/**
 * Workflow Progress Indicator Component
 *
 * Displays real-time progress for workflow execution
 * Integrates with useWorkflowProgress hook
 */

import React from "react";
import {
  Box,
  LinearProgress,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassIcon,
} from "@mui/icons-material";
import { useWorkflowProgress } from "../hooks/useWorkflowProgress.js";

/**
 * Main progress indicator component
 */
const WorkflowProgressIndicator = ({
  executionId,
  title,
  showDetails = true,
  showCancel = true,
  onComplete,
  onError,
  onCancel,
}) => {
  const {
    progress,
    isLoading,
    error,
    canCancel,
    cancelWorkflow,
    percentage,
    message,
    currentStep,
    completedSteps,
    totalSteps,
    estimatedCompletion,
    status,
  } = useWorkflowProgress(executionId);

  const [expanded, setExpanded] = React.useState(false);

  // Handle completion
  React.useEffect(() => {
    if (status === "completed" && onComplete) {
      onComplete(progress);
    }
  }, [status, progress, onComplete]);

  // Handle errors
  React.useEffect(() => {
    if (status === "failed" && onError) {
      onError(error, progress);
    }
  }, [status, error, progress, onError]);

  // Handle cancellation
  const handleCancel = () => {
    cancelWorkflow();
    if (onCancel) {
      onCancel();
    }
  };

  // Don't render if no progress data
  if (!progress) {
    return null;
  }

  // Get status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon color="success" />;
      case "failed":
        return <ErrorIcon color="error" />;
      case "cancelled":
        return <CancelIcon color="warning" />;
      case "running":
      default:
        return <HourglassIcon color="primary" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "cancelled":
        return "warning";
      case "running":
      default:
        return "primary";
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          {getStatusIcon()}
          <Typography variant="h6" sx={{ ml: 1, flex: 1 }}>
            {title || "Workflow Progress"}
          </Typography>

          <Chip
            label={status}
            color={getStatusColor()}
            size="small"
            sx={{ mr: 1 }}
          />

          {showCancel && canCancel && (
            <IconButton
              size="small"
              onClick={handleCancel}
              color="error"
              title="Cancel workflow"
            >
              <CancelIcon />
            </IconButton>
          )}

          {showDetails && (
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={getStatusColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percentage}%
            </Typography>
          </Box>
        </Box>

        {/* Detailed Information */}
        <Collapse in={expanded}>
          <Box sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" gutterBottom>
              <strong>Current Step:</strong> {currentStep || "N/A"}
            </Typography>

            <Typography variant="body2" gutterBottom>
              <strong>Progress:</strong> {completedSteps} of {totalSteps} steps
              completed
            </Typography>

            {estimatedCompletion && status === "running" && (
              <Typography variant="body2" gutterBottom>
                <strong>Estimated Completion:</strong>{" "}
                {new Date(estimatedCompletion).toLocaleTimeString()}
              </Typography>
            )}

            {progress.startTime && (
              <Typography variant="body2" gutterBottom>
                <strong>Started:</strong>{" "}
                {new Date(progress.startTime).toLocaleTimeString()}
              </Typography>
            )}

            {progress.endTime && (
              <Typography variant="body2" gutterBottom>
                <strong>Completed:</strong>{" "}
                {new Date(progress.endTime).toLocaleTimeString()}
              </Typography>
            )}

            {progress.actualDuration && (
              <Typography variant="body2">
                <strong>Duration:</strong>{" "}
                {Math.round(progress.actualDuration / 1000)}s
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

/**
 * Compact progress indicator for inline use
 */
export const CompactProgressIndicator = ({
  executionId,
  showCancel = false,
}) => {
  const { isLoading, canCancel, cancelWorkflow, percentage, message, status } =
    useWorkflowProgress(executionId);

  if (!isLoading && status !== "running") {
    return null;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 200 }}>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{ flex: 1, height: 4 }}
      />
      <Typography variant="caption" sx={{ minWidth: 40 }}>
        {percentage}%
      </Typography>
      {showCancel && canCancel && (
        <IconButton size="small" onClick={() => cancelWorkflow()}>
          <CancelIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

/**
 * Progress indicator for multiple workflows
 */
export const MultiWorkflowProgressIndicator = ({
  title = "Active Workflows",
}) => {
  const { activeWorkflows, stats } = useAllWorkflowProgress();

  if (activeWorkflows.length === 0) {
    return null;
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title} ({activeWorkflows.length})
        </Typography>

        {activeWorkflows.map((workflow) => (
          <Box key={workflow.executionId} sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              {workflow.workflowName}
            </Typography>
            <CompactProgressIndicator
              executionId={workflow.executionId}
              showCancel={true}
            />
          </Box>
        ))}

        {stats && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary">
              Success Rate: {Math.round(stats.successRate)}% | Avg Duration:{" "}
              {Math.round(stats.averageDuration / 1000)}s
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowProgressIndicator;
