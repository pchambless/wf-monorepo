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
  Grid,
  Button,
} from "@mui/material";
import { Architecture as ArchIcon, Add as AddIcon } from "@mui/icons-material";

// Import modular tab components
import PlanCommunicationTab from "./PlanCommunicationTab.jsx";
import PlanToolsTab from "./PlanToolsTab.jsx";
import StructureRelationshipsTab from "./StructureRelationshipsTab.jsx";

// Import architectural intelligence
import { getArchitecturalIntel } from "../intelligence.js";

// Import plan selector
import { SelPlan } from "@whatsfresh/shared-imports/jsx";

const ArchDashboard = () => {
  const [intel, setIntel] = useState(null);
  const [mainTab, setMainTab] = useState(0); // Main tab controller
  const [structureTab, setStructureTab] = useState(0); // Structure sub-tab controller
  const [selectedCategory, setSelectedCategory] = useState(1);
  // selectedPlan is handled by SelPlan widget and stored in contextStore

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

  const handleNewPlan = () => {
    // Switch to Plan Tools tab and select Create Plan
    setMainTab(1);
  };

  return (
    <Box p={1}>
      <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
        <ArchIcon sx={{ mr: 2, verticalAlign: "middle" }} />
        Project Command Center
      </Typography>

      {/* Plan Selection Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={10}>
              <SelPlan
                label="Active Plan"
                placeholder="Select a plan to work with..."
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNewPlan}
                fullWidth
              >
                New Plan
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
