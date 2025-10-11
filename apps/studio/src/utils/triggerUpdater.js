import { db } from '../db/studioDb';

export const loadTriggersForComponent = async (xref_id) => {
  const triggers = await db.eventTriggers
    .where('xref_id').equals(xref_id)
    .filter(t => t._dmlMethod !== "DELETE")
    .toArray();

  return triggers.map(t => ({
    id: t.id,
    class: t.class,
    action: t.action,
    ordr: t.ordr,
    content: t.content
  }));
};

export const updateTrigger = async (xref_id, trigger) => {
  if (trigger.id) {
    const existing = await db.eventTriggers.get(trigger.id);

    if (existing) {
      await db.eventTriggers.update(trigger.id, {
        class: trigger.class,
        action: trigger.action,
        ordr: trigger.ordr,
        content: trigger.content,
        _dmlMethod: existing._dmlMethod === null ? "UPDATE" : existing._dmlMethod
      });
    }
  } else {
    await db.eventTriggers.add({
      xref_id,
      id: trigger.id || null,
      class: trigger.class,
      action: trigger.action,
      ordr: trigger.ordr || 1,
      content: trigger.content || '',
      _dmlMethod: "INSERT"
    });
  }
};

export const deleteTrigger = async (triggerId) => {
  const existing = await db.eventTriggers.get(triggerId);

  if (existing) {
    if (existing._dmlMethod === "INSERT") {
      await db.eventTriggers.delete(triggerId);
    } else {
      await db.eventTriggers.update(triggerId, {
        _dmlMethod: "DELETE"
      });
    }
  }
};
