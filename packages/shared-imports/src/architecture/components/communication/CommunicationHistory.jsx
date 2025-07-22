/**
 * Communication History Component
 *
 * Displays timeline of User ↔ Claude ↔ Kiro communications
 */

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import {
  Person as UserIcon,
  SmartToy as ClaudeIcon,
  Build as KiroIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

// Mock communication history (would come from coordination system in real implementation)
const MOCK_COMMUNICATIONS = [
  {
    id: "user-001",
    from: "user",
    type: "strategic-input",
    priority: "high",
    subject: "Plan 0011 DML Process Priority",
    message:
      "This plan is blocking other development work. Please prioritize completion.",
    timestamp: "2025-07-21T20:30:00Z",
    affectedPlans: ["0011"],
    status: "acknowledged",
    responses: [
      {
        from: "claude",
        message:
          "Understood. Analyzing blocking dependencies and implementation requirements.",
        timestamp: "2025-07-21T20:35:00Z",
      },
      {
        from: "kiro",
        message:
          "Plan 0011 implementation completed successfully. DML process is now working end-to-end.",
        timestamp: "2025-07-21T22:15:00Z",
      },
    ],
  },
  {
    id: "claude-002",
    from: "claude",
    type: "architectural-question",
    priority: "normal",
    subject: "Plan 0015 Architectural Intelligence Implementation",
    message:
      "Comprehensive architectural analysis complete. Ready for Kiro implementation with modular component structure.",
    timestamp: "2025-07-21T18:00:00Z",
    affectedPlans: ["0015"],
    status: "completed",
    responses: [
      {
        from: "kiro",
        message:
          "Implementation complete! Modular architecture with 8 focused components created.",
        timestamp: "2025-07-21T19:30:00Z",
      },
    ],
  },
  {
    id: "user-003",
    from: "user",
    type: "scope-modification",
    priority: "normal",
    subject: "Plan 0016 User Communication Interface",
    message:
      "Love the three-tab approach! Please continue with Phase 2 and 3 implementation.",
    timestamp: "2025-07-21T21:45:00Z",
    affectedPlans: ["0016"],
    status: "in-progress",
    responses: [
      {
        from: "kiro",
        message:
          "Phase 2 Plan Tools interface completed! Moving to Phase 3 User Communication system.",
        timestamp: "2025-07-21T22:30:00Z",
      },
    ],
  },
];

const CommunicationHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);

  const handleAccordionChange = (itemId) => (event, isExpanded) => {
    setExpandedItem(isExpanded ? itemId : null);
  };

  const filteredCommunications = MOCK_COMMUNICATIONS.filter(
    (comm) =>
      comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.affectedPlans.some((plan) => plan.includes(searchTerm))
  );

  const getParticipantInfo = (participant) => {
    switch (participant) {
      case "user":
        return {
          name: "User",
          icon: <UserIcon />,
          color: "primary",
          avatar: "👤",
        };
      case "claude":
        return {
          name: "Claude",
          icon: <ClaudeIcon />,
          color: "secondary",
          avatar: "🧠",
        };
      case "kiro":
        return {
          name: "Kiro",
          icon: <KiroIcon />,
          color: "success",
          avatar: "🤖",
        };
      default:
        return {
          name: "System",
          icon: <KiroIcon />,
          color: "default",
          avatar: "⚙️",
        };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "normal":
        return "primary";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      case "acknowledged":
        return "info";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Communication timeline showing strategic collaboration between User,
        Claude, and Kiro
      </Alert>

      {/* Search Filter */}
      <TextField
        fullWidth
        placeholder="Search communications..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Communication Timeline */}
      <Timeline>
        {filteredCommunications.map((comm, index) => {
          const participantInfo = getParticipantInfo(comm.from);

          return (
            <TimelineItem key={comm.id}>
              <TimelineSeparator>
                <TimelineDot color={participantInfo.color}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: "1rem" }}>
                    {participantInfo.avatar}
                  </Avatar>
                </TimelineDot>
                {index < filteredCommunications.length - 1 && (
                  <TimelineConnector />
                )}
              </TimelineSeparator>

              <TimelineContent>
                <Accordion
                  expanded={expandedItem === comm.id}
                  onChange={handleAccordionChange(comm.id)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6">{comm.subject}</Typography>
                        <Chip
                          label={participantInfo.name}
                          color={participantInfo.color}
                          size="small"
                        />
                        <Chip
                          label={comm.priority.toUpperCase()}
                          color={getPriorityColor(comm.priority)}
                          size="small"
                        />
                        <Chip
                          label={comm.status.toUpperCase()}
                          color={getStatusColor(comm.status)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {formatTimestamp(comm.timestamp)} • Plans:{" "}
                        {comm.affectedPlans.join(", ")}
                      </Typography>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Box>
                      {/* Original Message */}
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="body1" gutterBottom>
                            {comm.message}
                          </Typography>
                        </CardContent>
                      </Card>

                      {/* Responses */}
                      {comm.responses && comm.responses.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Responses ({comm.responses.length})
                          </Typography>
                          {comm.responses.map((response, responseIndex) => {
                            const responseParticipant = getParticipantInfo(
                              response.from
                            );
                            return (
                              <Card
                                key={responseIndex}
                                variant="outlined"
                                sx={{ mb: 1, ml: 2 }}
                              >
                                <CardContent sx={{ py: 1.5 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        fontSize: "0.8rem",
                                      }}
                                    >
                                      {responseParticipant.avatar}
                                    </Avatar>
                                    <Typography variant="subtitle2">
                                      {responseParticipant.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                    >
                                      {formatTimestamp(response.timestamp)}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    {response.message}
                                  </Typography>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>

      {filteredCommunications.length === 0 && (
        <Alert severity="info">
          No communications found matching your search criteria.
        </Alert>
      )}
    </Box>
  );
};

export default CommunicationHistory;
