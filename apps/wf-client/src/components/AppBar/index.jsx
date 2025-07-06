import React from 'react';
import {
    AppBar as MuiAppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Box,
    useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';

const AppBar = ({
    title = 'WhatsFresh',
    open = false,
    onMenuClick,
    onLogout
}) => {
    const theme = useTheme();

    return (
        <MuiAppBar
            position="fixed"
            sx={{
                zIndex: theme.zIndex.drawer + 1,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                })
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>

                {onLogout && (
                    <Box>
                        <IconButton
                            color="inherit"
                            edge="end"
                            sx={{ mr: 1 }}
                        >
                            <AccountCircle />
                        </IconButton>

                        <Button
                            color="inherit"
                            onClick={onLogout}
                        >
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </MuiAppBar>
    );
};

export default AppBar;
