import { db } from '../db/studioDb';

const SERVER_URL = 'http://localhost:3001';

export const saveComponentsToMySQL = async (pageID) => {
  // pageID param kept for API compatibility but unused
  // All components in IndexedDB are for current page
  const components = await db.componentDrafts
    .filter(c => c._dmlMethod !== null)
    .toArray();

  const results = [];

  for (const comp of components) {
    try {
      if (comp._dmlMethod === "INSERT") {
        await fetch(`${SERVER_URL}/api/execDML`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'INSERT',
            table: 'api_wf.eventComp_xref',
            data: {
              comp_name: comp.comp_name,
              parent_id: comp.parent_id,
              comp_type: comp.comp_type,
              container: comp.container,
              posOrder: comp.posOrder,
              title: comp.title
            },
            userID: 'studio'
          })
        });
        results.push(`INSERT component ${comp.comp_name}`);

      } else if (comp._dmlMethod === "UPDATE") {
        await fetch(`${SERVER_URL}/api/execDML`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'UPDATE',
            table: 'api_wf.eventComp_xref',
            primaryKey: { xref_id: comp.xref_id },
            data: {
              comp_name: comp.comp_name,
              parent_id: comp.parent_id,
              container: comp.container,
              title: comp.title
            },
            userID: 'studio'
          })
        });
        results.push(`UPDATE component ${comp.xref_id}`);
      }

      await db.componentDrafts.update(comp.id, { _dmlMethod: null });

    } catch (error) {
      console.error(`❌ Failed to save component ${comp.xref_id}:`, error);
      throw error;
    }
  }

  return results;
};
