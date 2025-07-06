import React, { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';

/**
 * Error boundary component for graceful error handling
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        // Reset the error boundary state
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <Box
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h4" color="error" gutterBottom>
                        Something went wrong
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4 }}>
                        An error occurred in this component. Please try again or contact support.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={this.handleReset}
                            sx={{ mr: 2 }}
                        >
                            Try Again
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => window.location.href = '/'}
                        >
                            Go to Homepage
                        </Button>
                    </Box>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
