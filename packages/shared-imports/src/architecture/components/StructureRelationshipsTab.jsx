/**
 * Structure Relationships Tab
 *
 * System architecture analysis and dependency intelligence
 * Contains all the original architectural intelligence functionality
 */

import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";

// Import structure analysis components
import CriticalNodesView from "./structure-analysis/CriticalNodesView.jsx";
import FileCategoriesView from "./structure-analysis/FileCategoriesView.jsx";
import CrossPackageView from "./structure-analysis/CrossPackageView.jsx";
import DeadCodeView from "./structure-analysis/DeadCodeView.jsx";
import VisualizationView from "./structure-analysis/VisualizationView.jsx";

const StructureRelationshipsTab = ({
  intel,
  activeTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
}) => {
  if (!intel) {
    return (
      <Box>
        <Alert severity="error">
          Failed to load architectural intelligence data. Check console for
          details.
        </Alert>
      </Box>
    );
  }

  const summary = intel.generateSummaryReport();
  const categories = intel.getCategories();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Architecture Analysis
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Dependency analysis and architectural intelligence for system
        investigation
      </Alert>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Files
              </Typography>
              <Typography variant="h4">{summary.totalFiles}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Critical Nodes
              </Typography>
              <Typography variant="h4" color="error">
                {summary.criticalNodes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cross-Package Deps
              </Typography>
              <Typography variant="h4" color="warning.main">
                {summary.crossPackageDeps}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Dead Code Files
              </Typography>
              <Typography variant="h4" color="text.secondary">
                {summary.deadCodeCandidates}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Structure Analysis Tabs */}
      <Card>
        <CardHeader
          title={
            <Tabs value={activeTab} onChange={onTabChange}>
              <Tab label="Critical Nodes" />
              <Tab label="File Categories" />
              <Tab label="Cross-Package" />
              <Tab label="Dead Code" />
              <Tab label="Visualization" />
            </Tabs>
          }
        />
        <CardContent>
          {/* Critical Nodes Tab */}
          {activeTab === 0 && <CriticalNodesView intel={intel} />}

          {/* File Categories Tab */}
          {activeTab === 1 && (
            <FileCategoriesView
              intel={intel}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
            />
          )}

          {/* Cross-Package Tab */}
          {activeTab === 2 && <CrossPackageView intel={intel} />}

          {/* Dead Code Tab */}
          {activeTab === 3 && <DeadCodeView intel={intel} />}

          {/* Visualization Tab */}
          {activeTab === 4 && <VisualizationView intel={intel} />}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StructureRelationshipsTab;
