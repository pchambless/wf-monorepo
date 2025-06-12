import { getNavSections } from './routes';

/**
 * Navigation configuration for the application sidebar
 * Based on the section structure defined in routes.js
 */
export const navigationConfig = (acctID) => {
  // Get sections with their items from routes
  const sections = getNavSections();
  const result = [];
  
  // Process each section from the configuration
  sections.forEach(section => {    
    // For reference section, create a dropdown with children
    if (section.id === 'reference') {
      result.push({
        title: 'Account Data',
        icon: section.icon,
        children: section.items.map(item => ({
          title: item.label,
          path: item.path.replace(':acctID', acctID),
          icon: item.icon
        }))
      });
      return;
    }
    
    // For all other sections (including dashboard), use first item as entry point
    if (section.items.length > 0) {
      const firstItem = section.items[0];
      result.push({
        title: section.label,
        path: firstItem.path.replace(':acctID', acctID || ''),
        icon: section.icon
      });
    }
  });
  
  return result;
};
