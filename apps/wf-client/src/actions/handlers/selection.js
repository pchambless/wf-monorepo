import { triggerAction } from '../actionStore';
import { SELECTION, NAVIGATION } from '../core/constants';
import accountStore from '../../stores/accountStore'; // Import the store directly
import createLogger from '../../utils/logger';

const log = createLogger('ActionHandlers.Selection');

/**
 * Selection action handlers
 */
const selectionHandlers = {
  ITEM_SELECT: {
    // Account selection handler
    acctSelect: {
      description: "Handle account selection from the header dropdown",
      payload: {
        item: "Selected account object",
        itemType: "account",
        itemId: "Account ID",
        source: "accountSelector"
      },
      handlers: [
        {
          name: "Update current account",
          code: `accountStore.setCurrentAcctID(payload.item.id)`,
          implementation: (payload) => {
            log.info('Setting current account:', payload.item.id);
            accountStore.setCurrentAcctID(payload.item.id);
            // No need for external store anymore
          }
        },
        {
          name: "Initialize account store with new account",
          code: `initAccountStore()`,
          implementation: async () => {
            log.info('Reinitializing account store');
            await accountStore.initializeAcctData(true);
          }
        },
        {
          name: "Navigate to welcome page if needed",
          code: `if (payload.navigate) payload.navigate('/welcome')`,
          implementation: (payload) => {
            if (payload.navigate) {
              log.info('Navigating to welcome page');
              payload.navigate('/welcome');
            }
          }
        }
      ]
    },
    
    // Filter selection handler
    filterSelect: {
      description: "Handle filter option selection",
      payload: {
        item: "Selected filter option",
        itemType: "filter",
        filterId: "ID of the filter",
        source: "filterPanel"
      },
      handlers: [
        {
          name: "Apply filter to current list",
          code: `triggerAction(SELECTION.FILTER_APPLY, { 
            filter: payload.item, 
            listId: payload.listId 
          })`,
          implementation: (payload) => {
            log.info('Applying filter:', payload.item);
            triggerAction(SELECTION.FILTER_APPLY, {
              filter: payload.item,
              listId: payload.listId
            });
          }
        }
      ]
    }
  },
  
  // Modify ROW_SELECT to trigger navigation instead of tab changes
  ROW_SELECT: {
    description: "Handle table row selection",
    payload: {
      row: "Selected row data",
      entityType: "Type of entity selected",
      listContext: "Current list context"
    },
    handlers: [
      {
        name: "Update form with selected row data",
        implementation: (payload, context) => {
          // This handler only cares about updating the Form component
          if (context?.setFormData) {
            // Add more detailed logging for form data update
            const idField = payload.row?.id ? 'id' : 
              Object.keys(payload.row || {}).find(key => key.toLowerCase().endsWith('id'));
            
            log.debug('Updating form with row data', { 
              idField,
              id: payload.row?.[idField],
              tabId: payload.tabId,
              tabIndex: payload.tabIndex,
              fieldCount: Object.keys(payload.row || {}).length
            });
            
            // Pass form mode explicitly to ensure proper rendering
            context.setFormData(payload.row);
          } else {
            // Instead of just a warning, also provide guidance on fixing the issue
            log.warn('No setFormData method available in context', {
              contextSource: context?.__source || 'unknown',
              contextScope: context?.__scope || 'unknown',
              hasContext: !!context,
              contextKeys: context ? Object.keys(context) : []
            });
          }
        }
      },
      {
        name: "Navigate to detail page for selected item",
        implementation: (payload, context) => {
          // Only navigate if navigation function is provided
          if (context?.navigate && payload.row) {
            const idField = payload.idField || 'id';
            const id = payload.row[idField];
            
            // Determine detail page path based on entity type and context
            let detailPath;
            if (payload.entityType === 'ingredientType') {
              detailPath = `/ingredients/types/${id}/ingredients`;
            } else if (payload.entityType === 'ingredient') {
              const parentId = context.parentId;
              detailPath = `/ingredients/types/${parentId}/ingredients/${id}/batches`;
            } else if (payload.entityType === 'product') {
              const parentId = context.parentId;
              detailPath = `/products/types/${parentId}/products/${id}/batches`;
            }
            
            if (detailPath) {
              log.info(`Navigating to detail page: ${detailPath}`);
              context.navigate(detailPath);
              
              // Trigger navigation action for breadcrumbs, etc.
              triggerAction(NAVIGATION.DETAIL_NAVIGATE, {
                parentType: payload.entityType,
                parentId: id,
                childType: payload.childEntityType,
                path: detailPath
              });
            }
          }
        }
      }
    ]
  },
  
  // Update CONTEXT_CHANGE to use accountStore
  CONTEXT_CHANGE: {
    description: "Handle change in entity context",
    payload: {
      parentType: "Type of parent entity",
      parentId: "ID of parent entity", 
      childType: "Type of child entities to display"
    },
    handlers: [
      {
        name: "Set context parameters in store",
        implementation: (payload) => {
          if (payload.parentId && payload.parentType) {
            // Convert parent type to appropriate param name (for log display only)
            const paramName = payload.parentType === 'ingredientType' ? 'ingrTypeID' :
                             payload.parentType === 'product' ? 'productID' : 
                             `${payload.parentType}ID`;
            
            log.info(`Setting context parameter ${paramName}=${payload.parentId}`);
            
            // Use accountStore's entity selections
            accountStore.setEntitySelection(payload.parentType, payload.parentId);
          }
        }
      }
    ]
  },
  
  // Add a handler for the FORM.REFRESHED action to ensure form is properly cleared when tabs change
  FORM_REFRESHED: {
    description: "Handle form refresh requests",
    payload: {
      tabIndex: "Index of the active tab",
      tabId: "ID of the active tab",
      formMode: "Mode to set the form to (view, edit, add)"
    },
    summary: `
      Form refresh processing steps:
      1. Reset form data for new tab - Clears form data when tab changes
    `,
    handlers: [
      {
        name: "Reset form data for new tab",
        code: `resetFormData()`,
        priority: "high",
        implementation: (payload, context) => {
          if (context?.setFormData) {
            log.debug('Resetting form data for tab change', { 
              tabIndex: payload.tabIndex,
              formMode: payload.formMode || 'view'
            });
            
            // Clear form data and set to the specified mode
            context.setFormData({}, payload.formMode || 'view');
          }
        }
      }
    ]
  }
};

export default selectionHandlers;
