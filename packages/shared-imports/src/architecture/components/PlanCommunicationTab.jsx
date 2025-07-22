/**
 * Plan Communication Tab
 *
 * Strategic communication interface for User ↔ Claude ↔ Kiro collaboration
 * Provides forms for strategic input, priority changes, and scope modifications
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";

// Import communication components
import UserCommunicationForm from "./communication/UserCommunicationForm.jsx";
import CommunicationHistory from "./communication/CommunicationHistory.jsx";

const PlanCommunicationTab = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Strategic Communication Hub
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Bridge the gap between strategic business decisions and AI
        implementation
      </Alert>

      {/* Communication Sub-Tabs */}
      <Card>
        <CardHeader
          title={
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="New Communication" />
              <Tab label="Communication History" />
            </Tabs>
          }
        />
        <CardContent>
          {/* Tab 1: New Communication Form */}
          {activeTab === 0 && <UserCommunicationForm />}

          {/* Tab 2: Communication History */}
          {activeTab === 1 && <CommunicationHistory />}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlanCommunicationTab;
