/**
 * Agent Coordination Modal System - PHASE 3
 *
 * Modal notifications for agent coordination workflow
 * Supports Claude → Kiro, User → Agent, Kiro → Claude communication flows
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Alert,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Close as CloseIcon,
  Person as UserIcon,
  SmartToy as ClaudeIcon,
  Build as KiroIcon,
} from "@mui/icons-material";

const AgentCoordinationModal = ({ open, onClose, communication, scenario }) => {
  const [copied, setCopied] = useState(false);

  // Agent display utilities
  const getAgentInfo = (agent) => {
    switch (agent?.toLowerCase()) {
      case "user":
        return {
          name: "User",
          avatar: "👤",
          color: "primary",
          icon: <UserIcon />,
        };
      case "claude":
        return {
          name: "Claude",
          avatar: "🧠",
          color: "secondary",
          icon: <ClaudeIcon />,
        };
      case "kiro":
        return {
          name: "Kiro",
          avatar: "🤖",
          color: "success",
          icon: <KiroIcon />,
        };
      default:
        return { name: agent || "System", avatar: "⚙️", color: "default" };
    }
  };

  // Generate coordination message based on scenario
  const generateCoordinationMessage = () => {
    if (!communication) return "";

    const fromAgent = getAgentInfo(communication.from_agent);
    const toAgent = getAgentInfo(communication.to_agent);

    switch (scenario) {
      case "claude-guidance":
        return `Hi Kiro! Claude has created new guidance for Plan ${communication.plan_id}:

Subject: ${communication.subject}

${communication.message}

Please review and implement according to the guidance. Let me know if you need any clarification!

Communication ID: ${communication.id}`;

      case "user-issue":
        return `Hi ${toAgent.name}! I've identified an issue that needs your attention:

Plan: ${communication.plan_id}
Subject: ${communication.subject}

${communication.message}

Please address this when you have a chance. Thanks!

Communication ID: ${communication.id}`;

      case "kiro-completion":
        return `Hi Claude! Kiro has completed implementation for Plan ${communication.plan_id}:

Subject: ${communication.subject}

${communication.message}

Please review the implementation and provide any feedback. Ready for your analysis!

Communication ID: ${communication.id}`;

      default:
        return `New communication from ${fromAgent.name} to ${toAgent.name}:

Subject: ${communication.subject}
${communication.message}

Communication ID: ${communication.id}`;
    }
  };

  // Copy message to clipboard
  const handleCopyMessage = async () => {
    const message = generateCoordinationMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  // Get scenario-specific styling and content
  const getScenarioInfo = () => {
    switch (scenario) {
      case "claude-guidance":
        return {
          title: "New Guidance Available",
          color: "secondary",
          description: "Claude has created implementation guidance",
          actionText: "Copy message for Kiro",
        };
      case "user-issue":
        return {
          title: "Issue Reported",
          color: "warning",
          description: "User has identified an issue requiring attention",
          actionText: `Copy message for ${
            getAgentInfo(communication?.to_agent).name
          }`,
        };
      case "kiro-completion":
        return {
          title: "Implementation Complete",
          color: "success",
          description: "Kiro has completed implementation",
          actionText: "Copy message for Claude",
        };
      default:
        return {
          title: "Agent Coordination",
          color: "primary",
          description: "New communication requires coordination",
          actionText: "Copy message",
        };
    }
  };

  const scenarioInfo = getScenarioInfo();
  const fromAgent = getAgentInfo(communication?.from_agent);
  const toAgent = getAgentInfo(communication?.to_agent);

  if (!communication) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={scenarioInfo.title}
              color={scenarioInfo.color}
              variant="filled"
            />
            <Typography variant="h6">Plan {communication.plan_id}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          {scenarioInfo.description}. Copy the message below and paste it into
          the appropriate agent's chat.
        </Alert>

        {/* Agent Flow Visualization */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>{fromAgent.avatar}</Avatar>
            <Typography variant="body2">{fromAgent.name}</Typography>
          </Box>

          <Typography variant="h6" sx={{ mx: 2, color: "text.secondary" }}>
            →
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>👤</Avatar>
            <Typography variant="body2">You</Typography>
          </Box>

          <Typography variant="h6" sx={{ mx: 2, color: "text.secondary" }}>
            →
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>{toAgent.avatar}</Avatar>
            <Typography variant="body2">{toAgent.name}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Message to Copy */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: "grey.50",
            position: "relative",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            whiteSpace: "pre-wrap",
          }}
        >
          <IconButton
            onClick={handleCopyMessage}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: copied ? "success.main" : "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: copied ? "success.dark" : "primary.dark",
              },
            }}
            size="small"
          >
            <CopyIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="body2"
            sx={{
              pr: 5, // Space for copy button
              lineHeight: 1.5,
            }}
          >
            {generateCoordinationMessage()}
          </Typography>
        </Paper>

        {copied && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Message copied to clipboard! Paste it into {toAgent.name}'s chat.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          onClick={handleCopyMessage}
          variant="contained"
          startIcon={<CopyIcon />}
          color={scenarioInfo.color}
        >
          {scenarioInfo.actionText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentCoordinationModal;
