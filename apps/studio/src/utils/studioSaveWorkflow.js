import { db, getPendingSyncs } from '../db/studioDb';
import { saveComponentsToMySQL } from './componentSaver';
import { savePropsToMySQL } from './propSaver';
import { saveTriggersToMySQL } from './triggerSaver';

export const savePageToMySQL = async (pageID) => {
  console.log(`💾 Saving page ${pageID} to MySQL...`);

  const allOperations = [];
  let failed = 0;
  const errors = [];

  try {
    const componentResults = await saveComponentsToMySQL(pageID);
    allOperations.push(...componentResults);

    const components = await db.componentDrafts.where('pageID').equals(pageID).toArray();

    for (const comp of components) {
      const propResults = await savePropsToMySQL(comp.xref_id);
      allOperations.push(...propResults);

      const triggerResults = await saveTriggersToMySQL(comp.xref_id);
      allOperations.push(...triggerResults);
    }

    console.log(`✅ Saved ${allOperations.length} operations`);

    return {
      success: true,
      operations: allOperations,
      failed: 0,
      errors: []
    };

  } catch (error) {
    failed++;
    errors.push(error.message);
    console.error('❌ Save failed:', error);

    return {
      success: false,
      operations: allOperations,
      failed,
      errors
    };
  }
};

export const isDraftModified = async (pageID) => {
  const pending = await getPendingSyncs();
  return pending.total > 0;
};
