import React, { useState } from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import { execEvent } from '@whatsfresh/shared-imports';
import { contextStore } from '@whatsfresh/shared-imports';
import WorksheetPDF from './WorksheetPDF.jsx';

/**
 * Worksheet Generator Component
 * Handles data fetching and PDF generation for Product Batch Worksheets
 */
const WorksheetGenerator = ({ prodBtchID, batchData, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateWorksheet = async () => {
    if (!prodBtchID) {
      const errorMsg = 'No product batch ID available for worksheet generation';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch ingredients data
      const ingredientsData = await execEvent('rpt-WrkSht-Ingr', { ':prodBtchID': prodBtchID });
      
      // Fetch tasks data
      const tasksData = await execEvent('rpt-WrkSht-Task', { ':prodBtchID': prodBtchID });

      // Get batch header data (if not provided)
      let headerData = batchData;
      if (!headerData) {
        // Try to get batch info from context or ingredients data
        headerData = {
          company: contextStore.getParameter('acctName') || 'Company Name',
          product: 'Product Name', // Could be enhanced to get from batch data
          batchNumber: `Batch ${prodBtchID}`,
          date: new Date().toISOString().split('T')[0]
        };
      }

      // Generate PDF
      const pdfDoc = (
        <WorksheetPDF 
          batchData={headerData}
          ingredients={ingredientsData || []}
          tasks={tasksData || []}
        />
      );

      // Create blob and download
      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `batch-${prodBtchID}-worksheet.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);

    } catch (err) {
      const errorMsg = `Failed to generate worksheet: ${err.message}`;
      setError(errorMsg);
      onError?.(errorMsg);
      console.error('Worksheet generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={generateWorksheet}
        disabled={loading || !prodBtchID}
        startIcon={loading ? <CircularProgress size={20} /> : null}
        sx={{ mr: 1 }}
      >
        {loading ? 'Generating...' : 'Generate Worksheet'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default WorksheetGenerator;
