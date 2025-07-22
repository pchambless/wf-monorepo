/**
 * Project Command Center - Main Container
 *
 * Three-tab strategic workflow hub for User ↔ Claude ↔ Kiro collaboration
 * Modular architecture for easy maintenance and admin app migration
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import { Architecture as ArchIcon } from "@mui/icons-material";

// Import modular tab components
import PlanCommunicationTab from "./PlanCommunicationTab.jsx";
import PlanToolsTab from "./PlanToolsTab.jsx";
import StructureRelationshipsTab from "./StructureRelationshipsTab.jsx";

// Import architectural intelligence
import { getArchitecturalIntel } from "../intelligence.js";

const ArchDashboard = () => {
  const [intel, setIntel] = useState(null);
  const [mainTab, setMainTab] = useState(0); // Main tab controller
  const [structureTab, setStructureTab] = useState(0); // Structure sub-tab controller
  const [selectedCategory, setSelectedCategory] = useState(1);

  useEffect(() => {
    try {
      const architecturalIntel = getArchitecturalIntel();
      setIntel(architecturalIntel);
    } catch (error) {
      console.error("Failed to load architectural intelligence:", error);
    }
  }, []);

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };

  const handleStructureTabChange = (event, newValue) => {
    setStructureTab(newValue);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        <ArchIcon sx={{ mr: 2, verticalAlign: "middle" }} />
        Project Command Center
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Strategic workflow hub - will migrate to admin app when ready
      </Alert>

      {/* Main Tab Navigation */}
      <Card>
        <CardHeader
          title={
            <Tabs value={mainTab} onChange={handleMainTabChange}>
              <Tab label="Plan Communication" />
              <Tab label="Plan Tools" />
              <Tab label="Structure Relationships" />
            </Tabs>
          }
        />
        <CardContent>
          {/* Tab 1: Plan Communication */}
          {mainTab === 0 && <PlanCommunicationTab />}

          {/* Tab 2: Plan Tools */}
          {mainTab === 1 && <PlanToolsTab />}

          {/* Tab 3: Structure Relationships (existing functionality) */}
          {mainTab === 2 && (
            <StructureRelationshipsTab
              intel={intel}
              activeTab={structureTab}
              onTabChange={handleStructureTabChange}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ArchDashboard;
