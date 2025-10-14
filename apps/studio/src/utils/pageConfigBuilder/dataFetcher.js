import { db } from '../../db/studioDb';

export const getComponentProps = async (xref_id) => {
  const propsArray = await db.eventProps.where('xref_id').equals(xref_id).toArray();
  const props = {};

  propsArray.forEach(prop => {
    try {
      props[prop.paramName] = JSON.parse(prop.paramVal);
    } catch {
      props[prop.paramName] = prop.paramVal;
    }
  });

  return props;
};

export const getComponentTriggers = async (xref_id) => {
  const triggers = await db.eventTriggers.where('xref_id').equals(xref_id).toArray();
  return triggers;
};

export const getChildComponents = async (parent_id) => {
  const numericParentId = typeof parent_id === 'string' ? parseInt(parent_id, 10) : parent_id;
  const allComponents = await db.eventComp_xref.toArray();
  // Handle both string and number parent_id in IndexedDB
  const children = allComponents.filter(c => {
    const childParentId = typeof c.parent_id === 'string' ? parseInt(c.parent_id, 10) : c.parent_id;
    return childParentId === numericParentId;
  });
  return children;
};

export const getComponent = async (xref_id) => {
  const numericId = typeof xref_id === 'string' ? parseInt(xref_id, 10) : xref_id;
  const allComponents = await db.eventComp_xref.toArray();
  const component = allComponents.find(c => c.id === numericId);
  return component;
};
