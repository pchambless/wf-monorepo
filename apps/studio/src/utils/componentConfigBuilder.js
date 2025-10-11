import { db } from '../db/studioDb';

export const buildComponentConfig = async (xref_id) => {
  const component = await db.eventComp_xref.where('id').equals(xref_id).first();

  if (!component) {
    console.error(`❌ Component not found: ${xref_id}`);
    return null;
  }

  const propRecords = await db.eventProps.where('xref_id').equals(xref_id).toArray();

  const props = {};
  propRecords.forEach(p => {
    try {
      props[p.paramName] = JSON.parse(p.paramVal);
    } catch {
      props[p.paramName] = p.paramVal;
    }
  });

  const triggers = await db.eventTriggers
    .where('xref_id').equals(xref_id)
    .filter(t => t._dmlMethod !== "DELETE")
    .toArray();

  return {
    id: component.id,
    compID: component.id,
    comp_type: component.comp_type,
    name: component.comp_name,
    parentID: component.parent_id,
    parentName: component.parent_name,
    title: component.title,
    container: component.container,
    posOrder: component.posOrder,
    level: component.level,
    props,
    triggers: triggers.map(t => ({
      id: t.id,
      class: t.class,
      action: t.action,
      ordr: t.ordr,
      content: t.content
    })),
    style: component.style
  };
};

export const buildPageConfig = async (pageID) => {
  const components = await db.eventComp_xref
    .where('pageID').equals(pageID)
    .toArray();

  const configs = await Promise.all(
    components.map(c => buildComponentConfig(c.id))
  );

  const sorted = configs
    .filter(c => c !== null)
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return (a.posOrder || '').localeCompare(b.posOrder || '');
    });

  return {
    pageID,
    components: sorted
  };
};
