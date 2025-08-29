import React from 'react';
import '../../styles/components/DataBindingCard.css';

/**
 * Data Binding Card - Edit qry, displayConfig, cluster properties
 * Part of Studio Component Detail Cards system
 */
const DataBindingCard = ({ selectedEventType, onUpdate }) => {
  const [availableQueries, setAvailableQueries] = React.useState([]);

  // Load available queries when component mounts
  React.useEffect(() => {
    const loadQueries = async () => {
      try {
        const { getAvailableQueries } = await import('../../utils/queryDiscovery');
        const queries = await getAvailableQueries('plans'); // TODO: Get from contextStore
        setAvailableQueries(queries);
      } catch (error) {
        console.error('Failed to load queries:', error);
        setAvailableQueries([]);
      }
    };
    
    loadQueries();
  }, []);
  
  // If no eventType selected, show empty state
  if (!selectedEventType) {
    return (
      <div className="data-binding-empty">
        <p className="data-binding-empty-text">Select an eventType to configure data binding</p>
      </div>
    );
  }

  const handleFieldChange = (fieldName, value) => {
    console.log(`🟢 Data Binding - ${fieldName} changed to:`, value);
    
    const updatedEventType = {
      ...selectedEventType,
      [fieldName]: value
    };
    
    if (onUpdate) {
      onUpdate(updatedEventType);
    }
  };

  return (
    <div className="data-binding-card">
      <div className="data-binding-header">
        <span className="card-icon">🟢</span>
        <h3 className="card-title">Data Binding</h3>
      </div>
      
      <div className="data-binding-content">
        
        {/* Query Field - Only field in simplified Data Binding Card */}
        <div className="data-binding-field">
          <label className="data-binding-label">Query <span className="data-binding-hint-inline">(database query/view name)</span></label>
          <select
            value={selectedEventType.qry || ''}
            onChange={(e) => handleFieldChange('qry', e.target.value)}
            className="data-binding-input"
          >
            <option value="">Select query...</option>
            {availableQueries.map(query => (
              <option key={query} value={query}>{query}</option>
            ))}
          </select>
        </div>

        {/* Show current data binding status */}
        <div className="data-binding-status">
          <strong>Current Binding:</strong>
          <div className="data-binding-status-grid">
            <span className="data-binding-status-label">Query:</span>
            <span className="data-binding-status-value">{selectedEventType.qry || '<not set>'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};


export default DataBindingCard;