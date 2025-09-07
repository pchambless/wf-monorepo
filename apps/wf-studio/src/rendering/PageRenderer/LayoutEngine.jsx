/**
 * LayoutEngine - Handles field layout with row/percentage system
 * 
 * Groups fields by row and arranges them with flexbox
 * Supports percentage widths and responsive breakpoints
 */

import React from 'react';

const LayoutEngine = ({ fields, children }) => {
  
  /**
   * Group fields by row attribute for layout
   */
  const groupFieldsByRow = (fields) => {
    const rows = {};
    let currentRow = 1;

    fields.forEach((field, index) => {
      const row = field.row || currentRow;
      
      if (!rows[row]) {
        rows[row] = [];
      }
      
      rows[row].push({
        ...field,
        originalIndex: index
      });
      
      // If field has breakAfter, increment current row for next field
      if (field.breakAfter) {
        currentRow = row + 1;
      } else {
        // If no explicit row and no breakAfter, continue on current row
        currentRow = row;
      }
    });

    return Object.entries(rows)
      .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort by row number
      .map(([rowNum, rowFields]) => ({
        rowNumber: parseInt(rowNum),
        fields: rowFields
      }));
  };

  /**
   * Calculate if row needs special handling (wrapping, etc.)
   */
  const getRowStyle = (rowFields) => {
    const totalPercentage = rowFields.reduce((sum, field) => {
      const percentage = field.percentage ? parseInt(field.percentage.replace('%', '')) : 100;
      return sum + percentage;
    }, 0);

    return {
      display: 'flex',
      flexWrap: totalPercentage > 100 ? 'wrap' : 'nowrap',
      gap: '1rem',
      marginBottom: '1rem',
      alignItems: 'flex-start'
    };
  };

  /**
   * Get field style within row
   */
  const getFieldStyle = (field, rowFields) => {
    const style = {};

    // Apply percentage width
    if (field.percentage) {
      style.flexBasis = field.percentage;
      style.minWidth = 0; // Allows flex shrinking
    } else {
      // Default: equal width distribution
      const fieldsInRow = rowFields.length;
      style.flex = 1;
    }

    // Handle spacing - no margin-right for last field in row
    const isLastInRow = rowFields.indexOf(field) === rowFields.length - 1;
    if (!isLastInRow && !field.percentage) {
      style.marginRight = '1rem';
    }

    return style;
  };

  /**
   * Validate row layout for debugging
   */
  const validateRowLayout = (rowFields, rowNumber) => {
    const totalPercentage = rowFields.reduce((sum, field) => {
      if (field.percentage) {
        const percentage = parseInt(field.percentage.replace('%', ''));
        return sum + percentage;
      }
      return sum;
    }, 0);

    if (totalPercentage > 100) {
      console.warn(`Row ${rowNumber} exceeds 100% width: ${totalPercentage}%`, rowFields);
    }

    return {
      totalPercentage,
      isValid: totalPercentage <= 100,
      fieldsWithPercentage: rowFields.filter(f => f.percentage).length,
      fieldsWithoutPercentage: rowFields.filter(f => !f.percentage).length
    };
  };

  /**
   * Render debug information for Studio
   */
  const renderRowDebug = (rowData, validation) => {
    if (!validation.isValid) {
      return (
        <div className="row-debug warning">
          <small>
            ⚠️ Row {rowData.rowNumber}: {validation.totalPercentage}% exceeds 100%
          </small>
        </div>
      );
    }

    return (
      <div className="row-debug">
        <small>
          Row {rowData.rowNumber}: {rowData.fields.length} fields, {validation.totalPercentage}% width
        </small>
      </div>
    );
  };

  // Group fields by rows
  const fieldRows = groupFieldsByRow(fields);

  if (fieldRows.length === 0) {
    return <div className="no-fields">No fields to render</div>;
  }

  return (
    <div className="layout-engine">
      {fieldRows.map((rowData) => {
        const validation = validateRowLayout(rowData.fields, rowData.rowNumber);
        
        return (
          <div key={`row-${rowData.rowNumber}`} className="field-row-container">
            <div 
              className="field-row" 
              style={getRowStyle(rowData.fields)}
              data-row={rowData.rowNumber}
            >
              {rowData.fields.map((field) => (
                <div
                  key={`${field.name}-${field.originalIndex}`}
                  style={getFieldStyle(field, rowData.fields)}
                  className="field-layout-wrapper"
                >
                  {children(field)}
                </div>
              ))}
            </div>
            
            {/* Debug info - only show in development/Studio */}
            {process.env.NODE_ENV === 'development' && renderRowDebug(rowData, validation)}
          </div>
        );
      })}
    </div>
  );
};

export default LayoutEngine;