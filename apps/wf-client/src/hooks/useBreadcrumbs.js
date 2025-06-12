import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useEntityNames } from './useEntityNames';  // Matches the named export

export const useBreadcrumbs = () => {
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const params = useParams();
  const location = useLocation();
  const { getEntityName } = useEntityNames();
  
  useEffect(() => {
    const generateBreadcrumbs = async () => {
      // Base breadcrumbs
      const crumbs = [];
      
      // Parse current path
      const pathSegments = location.pathname.split('/').filter(Boolean);
      
      // Handle ingredients routes
      if (pathSegments[0] === 'ingredients') {
        // First level: Ingredients section
        crumbs.push({
          label: 'Ingredients',
          path: '/ingredients'
        });
        
        // Second level: Ingredient Types
        if (pathSegments[1] === 'types') {
          crumbs.push({
            label: 'Types',
            path: '/ingredients/types'
          });
          
          // Third level: Specific Ingredient Type
          if (params.typeId) {
            const typeName = await getEntityName('ingredient_type', params.typeId);
            crumbs.push({
              label: typeName,
              path: `/ingredients/types/${params.typeId}`
            });
            
            // Fourth level: Ingredients for this type
            if (pathSegments[3] === 'ingredients') {
              crumbs.push({
                label: 'Ingredients',
                path: `/ingredients/types/${params.typeId}/ingredients`
              });
              
              // Fifth level: Specific Ingredient
              if (params.ingredientId) {
                const ingredientName = await getEntityName('ingredient', params.ingredientId);
                crumbs.push({
                  label: ingredientName,
                  path: `/ingredients/types/${params.typeId}/ingredients/${params.ingredientId}`
                });
                
                // Sixth level: Batches for this ingredient
                if (pathSegments[5] === 'batches') {
                  crumbs.push({
                    label: 'Batches',
                    path: `/ingredients/types/${params.typeId}/ingredients/${params.ingredientId}/batches`
                  });
                }
              }
            }
          }
        }
      }
      
      setBreadcrumbs(crumbs);
    };
    
    generateBreadcrumbs();
  }, [location.pathname, params, getEntityName]);
  
  return { breadcrumbs };
};
