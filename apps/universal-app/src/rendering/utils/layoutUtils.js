/**
 * layoutUtils - Layout helper functions for DirectRenderer
 *
 * Provides utilities for component grouping, alignment, and type separation
 */

export const groupByRow = (components) => {
  const rows = {};
  components.forEach((comp) => {
    const row = comp.position?.row || 0;
    if (!rows[row]) rows[row] = [];
    rows[row].push(comp);
  });

  Object.keys(rows).forEach((rowKey) => {
    rows[rowKey].sort(
      (a, b) => (a.position?.order || 0) - (b.position?.order || 0)
    );
  });

  return rows;
};

export const getRowAlignment = (components) => {
  const firstAlign = components[0]?.position?.align || "left";
  const alignMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };
  return alignMap[firstAlign] || "flex-start";
};

export const separateComponentsByType = (components) => {
  // console.debug('🔍 separateComponentsByType input:', components?.map(c => ({
  //   id: c.id,
  //   comp_type: c.comp_type,
  //   hasChildren: !!c.components,
  //   childCount: c.components?.length || 0
  // })));

  // Recursively find all modals in the component tree
  const findModals = (comps, found = [], depth = 0) => {
    comps?.forEach(c => {
      // console.debug(`${'  '.repeat(depth)}Checking: ${c.id} (${c.comp_type})`); // Commented out to reduce noise
      if (c.comp_type === "Modal") {
        console.debug(`${'  '.repeat(depth)}✅ Found modal: ${c.id}`);
        found.push(c);
      }
      if (c.components) {
        findModals(c.components, found, depth + 1);
      }
    });
    return found;
  };

  // Recursively remove modals from the tree
  const removeModals = (comps) => {
    return comps?.filter(c => {
      if (c.comp_type === "Modal") return false;
      if (c.components) {
        c.components = removeModals(c.components);
      }
      return true;
    });
  };

  const appBarComponent = components?.find((c) => c.comp_type === "AppBar");
  const sidebarComponent = components?.find((c) => c.comp_type === "Sidebar");
  const modalComponents = findModals(components);
  const regularComponents = removeModals(
    components?.filter(
      (c) => c.comp_type !== "AppBar" && c.comp_type !== "Sidebar"
    )
  ) || [];

  // console.debug('🔍 separateComponentsByType:', {
  //   modalCount: modalComponents.length,
  //   modalIds: modalComponents.map(m => m.id),
  //   regularCount: regularComponents.length
  // });

  return {
    appBarComponent,
    sidebarComponent,
    modalComponents,
    regularComponents,
  };
};
