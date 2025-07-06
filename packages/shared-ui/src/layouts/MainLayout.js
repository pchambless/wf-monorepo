/**
 * Non-JSX version of MainLayout for server-side consumption
 * This avoids JSX parsing issues in Node.js environment
 */

// Export a simple placeholder function that warns if used
const MainLayout = () => {
    console.warn('MainLayout was imported from non-JSX bundle. Import from @whatsfresh/shared-imports/jsx instead.');
    return null;
};

export default MainLayout;
