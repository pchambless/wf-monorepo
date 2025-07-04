/**
 * DML Preview UI Components
 * Modal and preview components for DML operations
 */
import React from 'react';
import { modalStore } from '../../components/3-common/a-modal/index.js';
import { createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('DMLPreview');

/**
 * Show DML preview modal and get user confirmation
 */
export const showDMLPreview = (dmlData, sqlPreview, method, entityId) => {
  return new Promise((resolve) => {
    // Auto-approve in development if enabled
    if (process.env.REACT_APP_AUTO_APPROVE_DML === 'true' && process.env.NODE_ENV !== 'production') {
      log.info('Auto-approval enabled, skipping preview');
      setTimeout(() => resolve(true), 1000);
      return;
    }
    
    // Show preview modal
    modalStore.showModal({
      title: `${method} Preview - ${entityId}`,
      content: (
        <DMLPreviewContent 
          sqlPreview={sqlPreview}
          dmlData={dmlData}
          method={method}
          entityId={entityId}
        />
      ),
      actions: [
        {
          label: 'Execute',
          color: 'primary',
          variant: 'contained',
          onClick: () => {
            log.debug('User approved DML execution');
            modalStore.closeModal();
            resolve(true);
          }
        },
        {
          label: 'Cancel',
          color: 'inherit',
          onClick: () => {
            log.debug('User cancelled DML execution');
            modalStore.closeModal();
            resolve(false);
          }
        }
      ],
      size: 'lg',
      onClose: () => {
        log.debug('DML preview modal closed');
        resolve(false);
      }
    });
  });
};

/**
 * DML Preview Content Component
 */
const DMLPreviewContent = ({ sqlPreview, dmlData, method, entityId }) => (
  <div style={{ fontFamily: 'monospace' }}>
    <h3>DML Preview</h3>
    
    <div style={{ marginBottom: '1rem' }}>
      <strong>Operation:</strong> {method} on {entityId}
    </div>
    
    <div style={{ marginBottom: '1rem' }}>
      <strong>SQL Statement:</strong>
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1rem', 
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '0.9rem',
        border: '1px solid #ddd'
      }}>
        {sqlPreview}
      </pre>
    </div>
    
    <details style={{ marginBottom: '1rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
        DML Data (click to expand)
      </summary>
      <pre style={{ 
        backgroundColor: '#f0f8ff', 
        padding: '1rem', 
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '0.8rem',
        border: '1px solid #ddd',
        marginTop: '0.5rem'
      }}>
        {JSON.stringify(dmlData, null, 2)}
      </pre>
    </details>
    
    <div style={{ 
      padding: '0.5rem', 
      backgroundColor: '#fff3cd', 
      border: '1px solid #ffeaa7',
      borderRadius: '4px',
      fontSize: '0.85rem'
    }}>
      <strong>⚠️ Note:</strong> This will execute the above SQL statement. 
      Review carefully before proceeding.
    </div>
  </div>
);

export default DMLPreviewContent;