import { db } from '../db/studioDb';
import { execEvent } from '@whatsfresh/shared-imports';

const AUDIT_COLUMNS = ['created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by', 'active'];

const cleanRecord = (record) => {
  const cleaned = { ...record };
  AUDIT_COLUMNS.forEach(col => delete cleaned[col]);
  return cleaned;
};

const normalizeFieldName = (columns) => {
  if (!Array.isArray(columns)) return columns;
  return columns.map(col => {
    const { field_name, field, ...rest } = col;
    return {
      ...rest,
      name: col.name || field_name || field
    };
  });
};

export const loadPageForEditing = async (pageID) => {
  console.log(`📥 Loading page ${pageID} for editing (normalized)...`);

  try {
    await clearPageData(pageID);

    const hierarchyResult = await execEvent('xrefHierarchy', { xrefID: pageID });
    const hierarchyData = Array.isArray(hierarchyResult.data?.[0])
      ? hierarchyResult.data[0]
      : hierarchyResult.data;

    if (!Array.isArray(hierarchyData) || hierarchyData.length === 0) {
      console.warn('⚠️ No hierarchy data returned');
      return { success: false, message: 'No components found' };
    }

    console.log('🔍 Hierarchy data:', hierarchyData.map(c => ({
      id: c.id || c.xref_id,
      comp_name: c.comp_name
    })));

    let componentsLoaded = 0;
    let propsLoaded = 0;
    let triggersLoaded = 0;

    for (const comp of hierarchyData) {
      const cleanComp = cleanRecord(comp);
      const compId = cleanComp.xref_id || cleanComp.id;

      try {
        await db.eventComp_xref.add({
          pageID,
          id: compId, // MySQL id (from server)
          comp_name: cleanComp.comp_name,
          parent_id: cleanComp.parent_id,
          parent_name: cleanComp.parent_name,
          comp_type: cleanComp.comp_type,
          container: cleanComp.container,
          posOrder: cleanComp.posOrder,
          title: cleanComp.title,
          description: cleanComp.description,
          style: cleanComp.style,
          level: cleanComp.level,
          _dmlMethod: null
        });
        componentsLoaded++;
      } catch (err) {
        console.error(`❌ Duplicate component ID ${compId} (${cleanComp.comp_name})`, err);
        throw err;
      }

      const propsResult = await execEvent('xrefPropList', {
        xrefID: cleanComp.xref_id || cleanComp.id
      });

      const propsArray = Array.isArray(propsResult.data) ? propsResult.data : [];

      for (const prop of propsArray) {
        let paramVal = prop.paramVal;

        try {
          const parsed = JSON.parse(paramVal);
          if (parsed.columns) {
            parsed.columns = normalizeFieldName(parsed.columns);
          }
          paramVal = JSON.stringify(parsed);
        } catch {
        }

        if (!prop.id) {
          console.error('❌ Prop missing id:', prop);
          continue;
        }

        await db.eventProps.add({
          id: prop.id, // MySQL id (from server)
          xref_id: cleanComp.xref_id || cleanComp.id,
          paramName: prop.paramName,
          paramVal: paramVal,
          _dmlMethod: null
        });
        propsLoaded++;
      }

      const triggersResult = await execEvent('xrefTriggerList', {
        xrefID: cleanComp.xref_id || cleanComp.id
      });

      const triggers = Array.isArray(triggersResult.data) ? triggersResult.data : [];

      if (triggers.length > 0) {
        console.log(`🔍 Triggers for ${cleanComp.comp_name}:`, triggers.map(t => ({ id: t.id, class: t.class, action: t.action })));
      }

      for (const trigger of triggers) {
        const cleanTrigger = cleanRecord(trigger);
        await db.eventTriggers.add({
          xref_id: cleanComp.xref_id || cleanComp.id,
          id: cleanTrigger.id, // MySQL id (from server)

          class: cleanTrigger.class,
          action: cleanTrigger.action,
          ordr: cleanTrigger.ordr || 0,
          content: cleanTrigger.content,
          _dmlMethod: null
        });
        triggersLoaded++;
      }
    }

    console.log(`✅ Loaded: ${componentsLoaded} components, ${propsLoaded} props, ${triggersLoaded} triggers`);

    return {
      success: true,
      counts: {
        components: componentsLoaded,
        props: propsLoaded,
        triggers: triggersLoaded
      }
    };

  } catch (error) {
    console.error('❌ Failed to load page:', error);
    return { success: false, error: error.message };
  }
};

export const clearPageData = async (pageID) => {
  const components = await db.eventComp_xref.where('pageID').equals(pageID).toArray();
  const xrefIds = components.map(c => c.id);

  if (xrefIds.length > 0) {
    await db.eventProps.where('xref_id').anyOf(xrefIds).delete();
    await db.eventTriggers.where('xref_id').anyOf(xrefIds).delete();
  }

  await db.eventComp_xref.where('pageID').equals(pageID).delete();

  console.log(`✅ Cleared data for page ${pageID} (${xrefIds.length} components)`);
};
