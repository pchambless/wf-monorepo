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
import { Architecture as ArchIcon, Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";

// Import modular tab components
import PlanCommunicationTab from "./PlanCommunicationTab.jsx";
import PlanToolsTab from "./PlanToolsTab.jsx";
import StructureRelationshipsTab from "./StructureRelationshipsTab.jsx";

// Import architectural intelligence
import { getArchitecturalIntel } from "../intelligence.js";

// Import plan selector and context provider
import { SelPlan, PlanContextProvider } from "@whatsfresh/shared-imports/jsx";

const ArchDashboard = () => {
  const [intel, setIntel] = useState(null);
  const [mainTab, setMainTab] = useState(0); // Main tab controller
  const [structureTab, setStructureTab] = useState(0); // Structure sub-tab controller
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  // selectedPlan is handled by SelPlan widget and stored in contextStore

  useEffect(() => {
    const loadIntel = async () => {
      try {
        const architecturalIntel = await getArchitecturalIntel();
        setIntel(architecturalIntel);
      } catch (error) {
        console.error("Failed to load architectural intelligence:", error);
      }
    };
    
    loadIntel();
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

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      // Force reload of data from analysis-data folder
      const freshIntel = await getArchitecturalIntel(true);
      setIntel(freshIntel);
    } catch (error) {
      console.error("Failed to refresh architectural data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PlanContextProvider>
      <Box className="compact-container">
        <Typography variant="h4" className="compact-heading">
          <ArchIcon sx={{ mr: 2, verticalAlign: "middle" }} />
          Project Command Center
        </Typography>

        {/* Plan Selection Header */}
        <Card className="compact-card">
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
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleNewPlan}
                      fullWidth
                      size="small"
                    >
                      New Plan
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleRefreshData}
                      disabled={refreshing}
                      fullWidth
                      size="small"
                    >
                      {refreshing ? "..." : "Refresh"}
                    </Button>
                  </Grid>
                </Grid>
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
    </PlanContextProvider>
  );
};

export default ArchDashboard;
