import React from 'react';

/**
 * PreviewActions - Action component for preview tab
 * Apply/Cancel buttons for eventType changes with workflow integration
 */
const PreviewActions = ({ onApply, onCancel, hasChanges = false, applying = false }) => {
  
  return (
    <div className="preview-actions">
      <div className="actions-header">
        <h4>Preview Actions</h4>
        <span className="changes-indicator">
          {hasChanges ? '⚠️ Unsaved changes' : '✅ No changes to apply'}
        </span>
      </div>
      
      <div className="action-buttons">
        <button 
          className="apply-button primary"
          onClick={onApply}
          disabled={!hasChanges || applying}
          title={hasChanges ? 'Apply changes to eventType file' : 'No changes to apply'}
        >
          {applying ? (
            <>
              <span className="spinner">⟳</span>
              Applying...
            </>
          ) : (
            <>
              <span className="icon">✓</span>
              Apply Changes
            </>
          )}
        </button>
        
        <button 
          className="cancel-button secondary"
          onClick={onCancel}
          disabled={applying}
          title="Discard changes and revert to current eventType"
        >
          <span className="icon">✕</span>
          Cancel
        </button>
      </div>
      
      <div className="actions-footer">
        <p className="action-description">
          {hasChanges ? (
            <>
              <strong>Apply:</strong> Save changes to eventType file and refresh Studio<br/>
              <strong>Cancel:</strong> Discard changes and return to current version
            </>
          ) : (
            'Make changes in the property cards to see a preview here.'
          )}
        </p>
      </div>
    </div>
  );
};

export default PreviewActions;