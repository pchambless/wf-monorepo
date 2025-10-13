import Dexie from 'dexie';
import { v01 } from './versions/index.js';

export const db = new Dexie('StudioDB');

// Development: Increment version when schema changes
// Version 2: Removed pageID from eventComp_xref (redundant with clearWorkingData)
db.version(2).stores(v01);

export const clearAllData = async () => {
  await db.eventComp_xref.clear();
  await db.eventTriggers.clear();
  await db.eventProps.clear();
  await db.eventTypes.clear();
  await db.eventSQL.clear();
  await db.triggers.clear();
  console.log('✅ All draft data cleared');
};

// Reference data is now queried directly from master tables, no separate ref* tables
export const clearReferenceData = async () => {
  // No-op: ref* tables removed, query master tables directly
  console.log('✅ Reference data is queried from master tables (no separate ref* tables)');
};

export const exportAllData = async () => {
  const data = {
    eventComp_xref: await db.eventComp_xref.toArray(),
    eventTriggers: await db.eventTriggers.toArray(),
    eventProps: await db.eventProps.toArray(),
    eventTypes: await db.eventTypes.toArray(),
    eventSQL: await db.eventSQL.toArray(),
    triggers: await db.triggers.toArray()
  };
  return data;
};

export const getPendingSyncs = async () => {
  const components = await db.eventComp_xref.filter(c => c._dmlMethod !== null).toArray();
  const eventTriggers = await db.eventTriggers.filter(t => t._dmlMethod !== null).toArray();
  const props = await db.eventProps.filter(p => p._dmlMethod !== null).toArray();
  const eventTypes = await db.eventTypes.filter(et => et._dmlMethod !== null).toArray();
  const eventSQL = await db.eventSQL.filter(es => es._dmlMethod !== null).toArray();
  const triggers = await db.triggers.filter(t => t._dmlMethod !== null).toArray();

  return {
    components: components.length,
    eventTriggers: eventTriggers.length,
    props: props.length,
    eventTypes: eventTypes.length,
    eventSQL: eventSQL.length,
    triggers: triggers.length,
    total: components.length + eventTriggers.length + props.length + eventTypes.length + eventSQL.length + triggers.length
  };
};
