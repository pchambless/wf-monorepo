import React, { useState } from 'react';
import { Box, Paper, Grid, Typography, Tabs, Tab } from '@mui/material';
import { DataGridWidget } from '@whatsfresh/shared-ui/src/widgets/grid/DataGridWidget';
import { execEvent } from '@whatsfresh/shared-api';
import CrudTable from '@whatsfresh/shared-ui/src/widgets/data/CrudTable';
import SelProd from '@whatsfresh/shared-ui/src/widgets/selection/SelProd';
import { getWidgetById } from '@whatsfresh/shared-ui/src/registry';

/**
 * BatchMapping layout - implements the batch mapping interface with four tabs
 * Shows ingredient batches that can be mapped to product batches
 */
const BatchMapping = ({ prodID, prodBtchID }) => {
  // Tab state
  const [tabIndex, setTabIndex] = useState(0);
  
  // Selection states
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [selectedMapped, setSelectedMapped] = useState(null);
  const [selectedAvailable, setSelectedAvailable] = useState(null);
  
  // Data states
  const [recipeData, setRecipeData] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [availableData, setAvailableData] = useState([]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Tab panels structure
  const TabPanel = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: 2 }}>
      {value === index && children}
    </Box>
  );

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="h5">Product Batch Mapping</Typography>
          </Grid>
          <Grid item xs={6}>
            <SelProd 
              label="Product" 
              value={prodID} 
              onChange={id => console.log("Product changed:", id)} 
            />
          </Grid>
        </Grid>

        {/* Tab Navigation - Would use tabsNav widget if available */}
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Batches" />
          <Tab label="Mapping" />
          <Tab label="Tasks" />
          <Tab label="Worksheet" />
        </Tabs>

        {/* Batches Tab */}
        <TabPanel value={tabIndex} index={0}>
          <CrudTable
            eventName="prodBtchList"
            params={{ prodID: prodID}}
            height={500}
            title="Product Batches"
            onRowSelect={(row) => console.log("Selected batch:", row)}
          />
        </TabPanel>

        {/* Mapping Tab */}
        <TabPanel value={tabIndex} index={1}>
          <Grid container spacing={2}>
            {/* Left panel - Recipe ingredients */}
            <Grid item xs={4}>
              <Typography variant="subtitle1" gutterBottom>
                Recipe Ingredients
              </Typography>
              <DataGridWidget
                id="recipe-grid"
                eventName="btchMapIngrList"
                params={{ prodID: productId }}
                height={400}
                onSelectionChange={rows => setSelectedIngredient(rows[0])}
                columns={[
                  { field: 'ingr_ordr', headerName: 'Ord', width: 80 },
                  { field: 'ingr_name', headerName: 'Ingredient', flex: 1 }
                ]}
              />
            </Grid>

            {/* Middle panel - Mapped ingredient batches */}
            <Grid item xs={4}>
              <Typography variant="subtitle1" gutterBottom>
                Mapped Ingredient Batches
              </Typography>
              <DataGridWidget
                id="mapped-grid"
                eventName="btchMapMapped"
                params={{ 
                  prodBtchID: batchId,
                  ingrID: selectedIngredient?.ingr_id
                }}
                height={400}
                onSelectionChange={rows => setSelectedMapped(rows[0])}
                columns={[
                  { field: 'ingr_btch_nbr', headerName: 'Batch', flex: 1 },
                  { field: 'purch_date', headerName: 'Date', width: 120 }
                ]}
                actionButtons={[
                  {
                    label: 'Unmap',
                    icon: 'ArrowBack',
                    color: 'error',
                    onClick: () => console.log('Unmapping batch', selectedMapped)
                  }
                ]}
              />
            </Grid>

            {/* Right panel - Available ingredient batches */}
            <Grid item xs={4}>
              <Typography variant="subtitle1" gutterBottom>
                Available Ingredient Batches
              </Typography>
              <DataGridWidget
                id="available-grid"
                eventName="btchMapAvailable"
                params={{ 
                  prodBtchID: batchId,
                  ingrID: selectedIngredient?.ingr_id
                }}
                height={400}
                onSelectionChange={rows => setSelectedAvailable(rows[0])}
                columns={[
                  { field: 'ingr_btch_nbr', headerName: 'Batch', flex: 1 },
                  { field: 'purch_date', headerName: 'Date', width: 120 },
                  { field: 'vndr_name', headerName: 'Vendor', width: 150 }
                ]}
                actionButtons={[
                  {
                    label: 'Map',
                    icon: 'ArrowForward',
                    color: 'success',
                    onClick: () => console.log('Mapping batch', selectedAvailable, 'to', selectedIngredient)
                  }
                ]}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tasks Tab */}
        <TabPanel value={tabIndex} index={2}>
          <CrudTable
            eventName="prodBtchTaskList"
            params={{ prodBtchID: batchId }}
            height={500}
            title="Batch Tasks"
          />
        </TabPanel>

        {/* Worksheet Tab */}
        <TabPanel value={tabIndex} index={3}>
          <Typography>
            Worksheet and documentation content would go here.
            This could include printable reports, batch records, etc.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default BatchMapping;
