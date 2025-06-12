import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Collapse,
  Paper,
  Alert,
  Divider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

/**
 * Enhanced Error Modal component for error reporting and support
 */
const ErrorModal = ({ 
  title = 'An error occurred', 
  message = 'Something went wrong in the application.', 
  details = null,
  stack = null,
  timestamp = new Date().toISOString(),
  onClose
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Format technical details for support
  const technicalDetails = {
    timestamp,
    message,
    details,
    stack,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Format as text for clipboard
  const getErrorText = () => {
    return `ERROR REPORT
Timestamp: ${timestamp}
Error: ${message}
URL: ${window.location.href}
${details ? `\nDetails: ${details}` : ''}
${stack ? `\nStack: ${stack}` : ''}
User Agent: ${navigator.userAgent}`;
  };
  
  // Copy error details to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getErrorText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };
  
  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SentimentDissatisfiedIcon color="error" sx={{ fontSize: 32, mr: 2 }} />
        <Typography variant="h5" component="h2" color="error">
          {title}
        </Typography>
      </Box>
      
      <Typography paragraph>
        {message}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => setShowDetails(!showDetails)}
          startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mr: 2 }}
        >
          {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={copyToClipboard}
          startIcon={<ContentCopyIcon />}
        >
          Copy Error Details
        </Button>
        
        {copied && (
          <Alert severity="success" sx={{ ml: 2 }}>
            Copied to clipboard!
          </Alert>
        )}
      </Box>
      
      <Collapse in={showDetails}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            bgcolor: 'grey.100', 
            maxHeight: '200px', 
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            mb: 2
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(technicalDetails, null, 2)}
          </pre>
        </Paper>
      </Collapse>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button 
          variant="contained" 
          onClick={onClose}
          sx={{ mr: 2 }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default ErrorModal;
