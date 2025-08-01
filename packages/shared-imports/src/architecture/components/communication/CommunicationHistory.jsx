/**
 * Communication History Component - PHASE 2 Enhanced
 *
 * Master-Detail Layout for Plan Communications (EventID 102)
 * Database-driven living guidance system
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Alert,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Person as UserIcon,
  SmartToy as ClaudeIcon,
  Build as KiroIcon,
} from "@mui/icons-material";

// Import utilities for data fetching
import { execEvent } from "@whatsfresh/shared-imports";
import contextStore from "../../../stores/contextStore.js";
import { usePlanContext } from "../../../contexts/PlanContext.jsx";

// PHASE 2: Database-driven communications via EventID 102

const CommunicationHistory = () => {
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use plan context for automatic refresh when plan changes
  const { currentPlanId, isRefreshing } = usePlanContext(async (planId) => {
    await fetchCommunications(planId);
  });

  // Fetch communications data
  const fetchCommunications = async (planId) => {
    if (!planId) {
      setCommunications([]);
      return;
    }

    try {
      setLoading(true);
      const result = await execEvent("planCommunicationList", {
        ":planID": planId,
      });
      setCommunications(result || []);
    } catch (error) {
      console.error("Error fetching communications:", error);
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load when component mounts
  useEffect(() => {
    if (currentPlanId) {
      fetchCommunications(currentPlanId);
    }
  }, [currentPlanId]);

  // Agent display utilities
  const getAgentInfo = (agent) => {
    switch (agent?.toLowerCase()) {
      case "user":
        return { name: "User", avatar: "👤", color: "primary" };
      case "claude":
        return { name: "Claude", avatar: "🧠", color: "secondary" };
      case "kiro":
        return { name: "Kiro", avatar: "🤖", color: "success" };
      default:
        return { name: agent || "System", avatar: "⚙️", color: "default" };
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Message display component for right panel
  const MessageDisplay = ({ communication }) => {
    if (!communication) {
      return (
        <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="h6">Select a communication</Typography>
          <Typography variant="body2">
            Choose a message from the list to view details
          </Typography>
        </Paper>
      );
    }

    const fromAgent = getAgentInfo(communication.from_agent);
    const toAgent = getAgentInfo(communication.to_agent);

    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {communication.subject}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, fontSize: "0.8rem" }}>
                {fromAgent.avatar}
              </Avatar>
              <Typography variant="body2">{fromAgent.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                →
              </Typography>
              <Avatar sx={{ width: 24, height: 24, fontSize: "0.8rem" }}>
                {toAgent.avatar}
              </Avatar>
              <Typography variant="body2">{toAgent.name}</Typography>
            </Box>

            <Typography variant="caption" color="text.secondary">
              {formatTimestamp(communication.created_at)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {communication.message}
        </Typography>

        {communication.metadata && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Metadata: {JSON.stringify(communication.metadata, null, 2)}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Plan Communications - Database-driven living guidance system
        {isRefreshing && " (Refreshing...)"}
      </Alert>

      {!currentPlanId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please select a plan to view communications
        </Alert>
      )}

      {/* Master-Detail Layout for Communications */}
      <Grid container spacing={2}>
        {/* Left Panel: Communications List */}
        <Grid size={5}>
          <Paper sx={{ p: 1, height: "600px", overflow: "auto" }}>
            <DataGrid
              rows={communications}
              columns={[
                {
                  field: "from_agent",
                  headerName: "From",
                  width: 80,
                  renderCell: (params) => {
                    const agent = getAgentInfo(params.value);
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Avatar
                          sx={{ width: 16, height: 16, fontSize: "0.7rem" }}
                        >
                          {agent.avatar}
                        </Avatar>
                        <Typography variant="caption">{agent.name}</Typography>
                      </Box>
                    );
                  },
                },
                {
                  field: "to_agent",
                  headerName: "To",
                  width: 80,
                  renderCell: (params) => {
                    const agent = getAgentInfo(params.value);
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Avatar
                          sx={{ width: 16, height: 16, fontSize: "0.7rem" }}
                        >
                          {agent.avatar}
                        </Avatar>
                        <Typography variant="caption">{agent.name}</Typography>
                      </Box>
                    );
                  },
                },
                {
                  field: "subject",
                  headerName: "Subject",
                  flex: 1,
                  renderCell: (params) => (
                    <Typography variant="caption" sx={{ fontSize: "13px" }}>
                      {params.value}
                    </Typography>
                  ),
                },
                {
                  field: "created_at",
                  headerName: "Created",
                  width: 120,
                  renderCell: (params) => (
                    <Typography variant="caption" sx={{ fontSize: "11px" }}>
                      {formatTimestamp(params.value)}
                    </Typography>
                  ),
                },
              ]}
              loading={loading || isRefreshing}
              rowHeight={28}
              hideFooter
              onRowClick={(params) => setSelectedCommunication(params.row)}
              sx={{
                fontSize: "13px",
                "& .MuiDataGrid-cell": {
                  padding: "2px 8px",
                },
              }}
            />
          </Paper>
        </Grid>

        {/* Right Panel: Message Display */}
        <Grid size={7}>
          <Paper sx={{ p: 2, height: "600px", overflow: "auto" }}>
            {selectedCommunication ? (
              <MessageDisplay communication={selectedCommunication} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">
                  Select a communication to view details
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommunicationHistory;
