import React from 'react';
import { Box, Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import createLogger from '@utils/logger';

const log = createLogger('Breadcrumbs.MobX');

const Breadcrumbs = observer(() => {
  log.debug('Rendering MobX Breadcrumbs');
  const { pathname } = useLocation();
  
  // Simplified breadcrumb for now
  return (
    <Box sx={{ 
      p: 2, 
      pt: 1, 
      pb: 1,
      display: 'flex',
      alignItems: 'center'
    }}>
      <MuiBreadcrumbs aria-label="breadcrumb">
        <Link 
          component={RouterLink} 
          to="/welcome" 
          underline="hover" 
          color="inherit"
        >
          Home
        </Link>
        <Typography color="text.primary">
          {pathname.split('/').pop()}
        </Typography>
      </MuiBreadcrumbs>
    </Box>
  );
});

export default Breadcrumbs;
