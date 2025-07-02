/**
 * Admin App Sidebar Navigation Configuration
 * Hand-crafted navigation structure for admin workflow
 */

export const SIDEBAR_SECTIONS = [
  {
    id: 'administration',
    title: 'Administration',
    icon: 'AdminPanelSettings',
    collapsible: false,
    items: [
      {
        id: 'accounts',
        label: 'Accounts',
        eventType: 'acctList',
        description: 'Manage customer accounts and organizations'
      },
      {
        id: 'users',
        label: 'Users',
        eventType: 'userList',
        description: 'Manage user accounts and permissions'
      }
    ]
  }
];

/**
 * Get navigation sections for the admin app
 */
export function getNavSections() {
  return SIDEBAR_SECTIONS;
}

/**
 * Get route info by eventType
 */
export function getRoute(eventType) {
  for (const section of SIDEBAR_SECTIONS) {
    for (const item of section.items) {
      if (item.eventType === eventType) {
        return {
          eventType: item.eventType,
          label: item.label,
          section: section.title
        };
      }
    }
  }
  return null;
}