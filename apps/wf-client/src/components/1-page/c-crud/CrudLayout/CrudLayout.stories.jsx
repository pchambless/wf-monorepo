import React from 'react';
import { CrudLayout } from './index';
import { observer } from 'mobx-react';
import { action } from '@storybook/addon-actions';

// Import pageMaps
import ingrList from '@whatsfresh/shared-config/src/pageMap/ingrList';
// Import sample data
import sampleIngredients from '@whatsfresh/tools/data-generator/samples/ingredients.json';

const meta = {
  title: 'CRUD/CrudLayout',
  component: CrudLayout,
  parameters: {
    layout: 'fullscreen',
  }
};

export default meta;

// Create a simple store mock that the CrudLayout can use
const createStoreMock = (pageMap, data = []) => {
  return {
    pageMap,
    records: data,
    selectedRecord: null,
    isLoading: false,
    isFormOpen: false,
    error: null,
    
    // Methods
    loadData: () => action('loadData')(),
    setSelectedRecord: (record) => action('setSelectedRecord')(record),
    openForm: () => action('openForm')(),
    closeForm: () => action('closeForm')(),
    saveRecord: (record) => action('saveRecord')(record),
    deleteRecord: (id) => action('deleteRecord')(id),
  };
};

// Create the CrudLayout story with your sample data
export const IngredientsLayout = () => {
  const storeMock = createStoreMock(ingrList, sampleIngredients.slice(0, 10));
  
  // Use observer to make component reactive to store changes
  const ObservedStory = observer(() => (
    <CrudLayout 
      store={storeMock}
      title="Ingredients"
    />
  ));
  
  return <ObservedStory />;
};

// Show table-only mode
export const TableOnlyMode = () => {
  const storeMock = createStoreMock(ingrList, sampleIngredients.slice(0, 10));
  storeMock.formDisabled = true;
  
  const ObservedStory = observer(() => (
    <CrudLayout 
      store={storeMock}
      title="Ingredients (Read Only)"
    />
  ));
  
  return <ObservedStory />;
};

// Add this new story to show both table and form side by side

// Combined view showing both table and form together
export const TableAndFormView = () => {
  const storeMock = createStoreMock(ingrList, sampleIngredients.slice(0, 10));
  
  // Pre-configure the store to show both components
  storeMock.isFormOpen = true;
  storeMock.selectedRecord = sampleIngredients[0]; // Select first record for editing
  
  const ObservedStory = observer(() => (
    <CrudLayout 
      store={storeMock}
      title="Ingredients (Edit Mode)"
    />
  ));
  
  return <ObservedStory />;
};
