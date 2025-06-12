import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Grid } from '@mui/material';
import EntitySelector from '@components/3-common/EntitySelector';
import { getSelectorsForPage } from '@config/SelectorConfig';
import accountStore from '@stores/accountStore';
import { safeProp } from '@utils/mobxHelpers'; // Add this import

const SelectorPanel = observer(({ pageId, onSelectionChange }) => {
  const selectors = safeProp(() => getSelectorsForPage(pageId), []);
  
  if (selectors.length === 0) return null;
  
  // Track enabled state for dependent selectors
  const [enabledSelectors, setEnabledSelectors] = useState({});
  
  // Initialize enabled state on mount
  useEffect(() => {
    const initialState = {};
    selectors.forEach(selector => {
      const id = safeProp(() => selector.id);
      if (!id) return; // Skip if no valid ID
      
      if (!safeProp(() => selector.dependsOn)) {
        initialState[id] = true;
      } else {
        initialState[id] = !!safeProp(() => 
          accountStore.getSelectedEntity(selector.dependsOn), 
          false
        );
      }
    });
    setEnabledSelectors(initialState);
  }, [selectors]);
  
  const handleSelectorChange = (selector, value) => {
    // Enable dependent selectors
    const updatedState = { ...enabledSelectors };
    selectors.forEach(sel => {
      if (sel.dependsOn === selector.idField) {
        updatedState[sel.id] = true;
      }
    });
    setEnabledSelectors(updatedState);
    
    // Clear dependent selections when parent changes
    selectors.forEach(sel => {
      if (sel.dependsOn === selector.idField) {
        accountStore.setSelectedEntity(sel.idField, null);
      }
    });
    
    // Notify parent component
    if (onSelectionChange) {
      onSelectionChange(selector.idField, value);
    }
  };
  
  return (
    <Grid container spacing={2}>
      {selectors.map(selector => (
        <Grid item xs={12} sm={4} md={3} lg={2} key={safeProp(() => selector.id, 'key-'+Math.random())}>
          <EntitySelector
            {...selector}
            disabled={!safeProp(() => enabledSelectors[selector.id], true)}
            onChange={(value) => handleSelectorChange(selector, value)}
          />
        </Grid>
      ))}
    </Grid>
  );
});

export default SelectorPanel;
