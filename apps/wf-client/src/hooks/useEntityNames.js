import { useState, useCallback } from 'react';
import { execEvent } from '../stores';
import createLogger from '../utils/logger';

const log = createLogger('useEntityNames');

/**
 * Hook to fetch entity names by their IDs
 */
export const useEntityNames = () => {
  const [cache, setCache] = useState({});
  
  // Function to get an entity name by type and ID
  const getEntityName = useCallback(async (entityType, entityId) => {
    if (!entityType || !entityId) return null;
    
    // Check cache first
    const cacheKey = `${entityType}_${entityId}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    
    try {
      // Map entity types to appropriate API events
      const eventMap = {
        'ingrType': 'ingrTypeList',
        'ingredient': 'ingrList',
        'prodType': 'prodTypeList',
        'product': 'prodList',
        'account': 'userAcctList',
        // Add more entity types as needed
      };
      
      const event = eventMap[entityType];
      if (!event) {
        log.warn(`No event mapping for entity type: ${entityType}`);
        return null;
      }
      
      const result = await execEvent(event, { id: entityId });
      
      if (result) {
        // Extract name based on entity type
        let name;
        switch (entityType) {
          case 'ingrType':
            name = result.ingrTypeName;
            break;
          case 'ingredient':
            name = result.ingrName;
            break;
          case 'prodType':
            name = result.prodTypeName;
            break;
          case 'product':
            name = result.prodName;
            break;
          case 'account':
            name = result.acctName;
            break;
          default:
            name = result.name || `${entityType} ${entityId}`;
        }
        
        // Update cache
        setCache(prev => ({
          ...prev,
          [cacheKey]: name
        }));
        
        return name;
      }
    } catch (error) {
      log.error(`Error fetching ${entityType} name for ID ${entityId}:`, error);
    }
    
    return `${entityType} ${entityId}`;
  }, [cache]);
  
  return { getEntityName };
};
