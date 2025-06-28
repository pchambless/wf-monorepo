import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

/**
 * Standardized page footer with copyright and optional links
 */
const PageFooter = ({ 
  companyName = 'Whatsfresh',
  links = []
}) => {
  const year = new Date().getFullYear();
  
  return (
    <Box sx={{ mt: 4, pt: 2 }}>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 2
      }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {year} {companyName}. All rights reserved.
        </Typography>
        
        {links.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {links.map((link, index) => (
              <Typography 
                key={`footer-link-${index}`}
                variant="body2" 
                component="a"
                href={link.href}
                color="primary"
                sx={{ textDecoration: 'none' }}
              >
                {link.label}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageFooter;
