import { db } from '../../db/studioDb';

export const getComponentProps = async (xref_id) => {
  console.log('🔍 getComponentProps called for xref_id:', xref_id, 'type:', typeof xref_id);
  const propsArray = await db.eventProps.where('xref_id').equals(xref_id).toArray();
  console.log('🔍 Found props in IndexedDB:', propsArray);
  const props = {};

  propsArray.forEach(prop => {
    try {
      const parsedVal = JSON.parse(prop.paramVal);

      // If paramName is "props" and paramVal is an object, merge it into props
      if (prop.paramName === 'props' && typeof parsedVal === 'object' && parsedVal !== null) {
        Object.assign(props, parsedVal);
      } else {
        props[prop.paramName] = parsedVal;
      }
    } catch {
      props[prop.paramName] = prop.paramVal;
    }
  });

  console.log('🔍 Returning props object:', props);
  return props;
};

export const getComponentTriggers = async (xref_id) => {
  const numericId = typeof xref_id === 'string' ? parseInt(xref_id, 10) : xref_id;
  const allTriggers = await db.eventTriggers.toArray();
  const triggers = allTriggers.filter(t => {
    const triggerXrefId = typeof t.xref_id === 'string' ? parseInt(t.xref_id, 10) : t.xref_id;
    return triggerXrefId === numericId;
  });
  return triggers;
};

export const getChildComponents = async (parent_id) => {
  const numericParentId = typeof parent_id === 'string' ? parseInt(parent_id, 10) : parent_id;
  const allComponents = await db.eventComp_xref.toArray();
  // Handle both string and number parent_id in IndexedDB
  // Exclude self-references (Container with parent_id = id)
  const children = allComponents.filter(c => {
    const childParentId = typeof c.parent_id === 'string' ? parseInt(c.parent_id, 10) : c.parent_id;
    const childId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
    return childParentId === numericParentId && childId !== numericParentId;
  });
  return children;
};

export const getComponent = async (xref_id) => {
  const numericId = typeof xref_id === 'string' ? parseInt(xref_id, 10) : xref_id;
  const allComponents = await db.eventComp_xref.toArray();
  const component = allComponents.find(c => c.id === numericId);
  return component;
};
