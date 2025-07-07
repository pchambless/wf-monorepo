import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

/**
 * Layout for authentication pages (login, register, password reset)
 * Provides consistent styling for all auth-related screens
 * 
 * @param {React.ReactNode} children - The content to render inside the layout
 * @param {string} title - Optional title to display above the content
 * @param {string} appName - Optional app name to display (defaults to "WhatsFresh")
 * @param {string} logoSrc - Optional logo source (defaults to "/logo.png")
 */
const AuthLayout = ({
    children,
    title,
    appName = "WhatsFresh",
    logoSrc = "/logo.png"
}) => {
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                // Nice gradient background
                backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={4}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    {/* Logo section */}
                    <Box mb={4} display="flex" flexDirection="column" alignItems="center">
                        <img
                            src={logoSrc}
                            alt={`${appName} Logo`}
                            style={{ height: 60, marginBottom: 16 }}
                        />
                        <Typography variant="h5">{appName}</Typography>
                    </Box>

                    {/* Optional title */}
                    {title && (
                        <Typography variant="h5" component="h1" gutterBottom>
                            {title}
                        </Typography>
                    )}

                    {/* Content */}
                    {children}
                </Paper>
            </Container>

            {/* Footer */}
            <Box
                position="absolute"
                bottom={0}
                width="100%"
                p={2}
                textAlign="center"
            >
                <Typography variant="body2" color="text.secondary">
                    © {new Date().getFullYear()} {appName}
                </Typography>
            </Box>
        </Box>
    );
};

export default AuthLayout;
