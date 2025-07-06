import React from 'react';
import { Box } from '@mui/material';
import logoImg from '@assets/wf-icon.png';

const Logo = ({ sx = {} }) => {
  return (
    <Box
      component="img"
      src={logoImg}
      alt="WhatsFresh Logo"
      sx={{
        width: 40,
        height: 40,
        objectFit: 'contain',
        ...sx
      }}
    />
  );
};

export default Logo;
