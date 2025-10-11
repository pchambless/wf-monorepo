import { db } from '../db/studioDb';

const SERVER_URL = 'http://localhost:3001';

export const saveTriggersToMySQL = async (xref_id) => {
  const triggers = await db.triggerDrafts
    .where('xref_id').equals(xref_id)
    .filter(t => t._dmlMethod !== null)
    .toArray();

  const results = [];

  for (const trigger of triggers) {
    try {
      if (trigger._dmlMethod === "INSERT") {
        const response = await fetch(`${SERVER_URL}/api/execDML`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'INSERT',
            table: 'api_wf.eventTrigger',
            data: {
              xref_id,
              class: trigger.class,
              action: trigger.action,
              ordr: trigger.ordr || 0,
              content: trigger.content
            },
            userID: 'studio'
          })
        });

        const result = await response.json();
        await db.triggerDrafts.update(trigger.id, {
          trigger_id: result.insertId,
          _dmlMethod: null
        });

        results.push(`INSERT trigger ${trigger.class}`);

      } else if (trigger._dmlMethod === "UPDATE") {
        await fetch(`${SERVER_URL}/api/execDML`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'UPDATE',
            table: 'api_wf.eventTrigger',
            primaryKey: { id: trigger.trigger_id },
            data: {
              class: trigger.class,
              action: trigger.action,
              ordr: trigger.ordr || 0,
              content: trigger.content
            },
            userID: 'studio'
          })
        });

        await db.triggerDrafts.update(trigger.id, { _dmlMethod: null });
        results.push(`UPDATE trigger ${trigger.trigger_id}`);

      } else if (trigger._dmlMethod === "DELETE") {
        await fetch(`${SERVER_URL}/api/execDML`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'DELETE',
            table: 'api_wf.eventTrigger',
            primaryKey: { id: trigger.trigger_id },
            userID: 'studio'
          })
        });

        await db.triggerDrafts.delete(trigger.id);
        results.push(`DELETE trigger ${trigger.trigger_id}`);
      }

    } catch (error) {
      console.error(`❌ Failed to save trigger:`, error);
      throw error;
    }
  }

  return results;
};
