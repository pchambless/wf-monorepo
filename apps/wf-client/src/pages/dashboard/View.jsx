import React from 'react';
import { 
  Typography, Grid, Card, CardContent, Box, Paper
} from '@mui/material';

const DashboardView = () => {
  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Welcome to WhatsFresh
          </Typography>
        </Box>
        <Typography paragraph>
          WhatsFresh helps you manage your ingredients, products, recipes, and production
          batches in one centralized system. Use the navigation sidebar to access the different
          sections of the application.
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Recent Activity Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recent activity to display.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* System Status Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Typography variant="body2" color="primary">
                All systems operational
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardView;
