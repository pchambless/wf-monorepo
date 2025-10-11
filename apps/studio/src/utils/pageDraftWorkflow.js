import { db } from '../db/studioDb';
import { execEvent } from '@whatsfresh/shared-imports';

const SERVER_URL = 'http://localhost:3001';
const CACHE_TTL = 5 * 60 * 1000;

export const loadPageForEditing = async (pageID) => {
  console.log(`📥 Loading page ${pageID} for editing...`);

  const cached = await db.pageDrafts.get(pageID);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL) && !cached.modified) {
    console.log('✅ Using cached page data (fresh, unmodified)');
    return cached.components;
  }

  if (cached?.modified) {
    console.log('⚠️ Found unsaved changes in cache');
    const restore = window.confirm('You have unsaved changes. Restore them?');
    if (restore) {
      return cached.components;
    }
  }

  console.log('🔄 Fetching fresh page data from MySQL...');

  const hierarchyResult = await execEvent('xrefHierarchy', { xrefID: pageID });
  const hierarchyData = Array.isArray(hierarchyResult.data?.[0])
    ? hierarchyResult.data[0]
    : hierarchyResult.data;

  if (!Array.isArray(hierarchyData) || hierarchyData.length === 0) {
    console.warn('⚠️ No hierarchy data returned');
    return [];
  }

  const components = await Promise.all(
    hierarchyData.map(async (comp) => {
      try {
        const propsResult = await execEvent('getComponentProps', {
          eventID: comp.eventID,
          compID: comp.compID
        });
        const triggersResult = await execEvent('getComponentTriggers', {
          eventID: comp.eventID,
          compID: comp.compID
        });

        let props = propsResult.data || {};

        // Normalize field_name to name in columns/fields arrays
        if (props.columns && Array.isArray(props.columns)) {
          props.columns = props.columns.map(col => ({
            ...col,
            name: col.field_name || col.name
          }));
        }
        if (props.fields && Array.isArray(props.fields)) {
          props.fields = props.fields.map(field => ({
            ...field,
            name: field.field_name || field.name
          }));
        }

        // Mark triggers with _dmlMethod: null (existing, unchanged)
        const triggers = Array.isArray(triggersResult.data)
          ? triggersResult.data.map(t => ({ ...t, _dmlMethod: null }))
          : [];

        return {
          ...comp,
          props,
          triggers,
          // Track changes
          _dmlMethod: null,        // null = no component-level changes
          _propChanges: null,      // null = no prop changes
          _originalProps: JSON.stringify(props),
          _originalTriggers: JSON.stringify(triggers)
        };
      } catch (error) {
        console.error(`Failed to load data for component ${comp.compID}:`, error);
        return {
          ...comp,
          props: {},
          triggers: []
        };
      }
    })
  );

  await db.pageDrafts.put({
    pageID,
    components,
    modified: false,
    timestamp: Date.now()
  });

  console.log(`✅ Loaded ${components.length} components into cache`);
  return components;
};

export const updateComponentInDraft = async (pageID, compID, updates) => {
  const draft = await db.pageDrafts.get(pageID);

  if (!draft) {
    console.error('❌ No draft found for page', pageID);
    return false;
  }

  const component = draft.components.find(c => c.compID === compID);

  if (!component) {
    console.error('❌ Component not found in draft', compID);
    return false;
  }

  // Update props and mark as changed
  if (updates.props) {
    component.props = {
      ...component.props,
      ...updates.props
    };
    component._propChanges = component._propChanges || {};
    Object.keys(updates.props).forEach(key => {
      component._propChanges[key] = "UPDATE";
    });
  }

  // Update triggers if provided
  if (updates.triggers !== undefined) {
    component.triggers = updates.triggers;
  }

  // Mark other component-level changes
  if (updates.title || updates.container || updates.parentCompID || updates.sequence) {
    Object.assign(component, updates);
    component._dmlMethod = "UPDATE";
  }

  draft.modified = true;
  draft.timestamp = Date.now();

  await db.pageDrafts.put(draft);
  console.log(`✅ Component ${compID} updated in draft`);
  return true;
};

export const updateComponentProp = async (pageID, compID, propKey, propValue) => {
  const draft = await db.pageDrafts.get(pageID);

  if (!draft) return false;

  const component = draft.components.find(c => c.compID === compID);
  if (!component) return false;

  component.props[propKey] = propValue;
  draft.modified = true;
  draft.timestamp = Date.now();

  await db.pageDrafts.put(draft);
  console.log(`✅ Property ${propKey} updated for component ${compID}`);
  return true;
};

export const addComponentTrigger = async (pageID, compID, trigger) => {
  const draft = await db.pageDrafts.get(pageID);

  if (!draft) return false;

  const component = draft.components.find(c => c.compID === compID);
  if (!component) return false;

  // New trigger - mark for INSERT
  component.triggers.push({
    ...trigger,
    id: null,
    _dmlMethod: "INSERT"
  });

  draft.modified = true;
  draft.timestamp = Date.now();

  await db.pageDrafts.put(draft);
  console.log(`✅ Trigger added to component ${compID} (marked INSERT)`);
  return true;
};

export const updateComponentTrigger = async (pageID, compID, triggerIndex, updates) => {
  const draft = await db.pageDrafts.get(pageID);

  if (!draft) return false;

  const component = draft.components.find(c => c.compID === compID);
  if (!component) return false;

  const trigger = component.triggers[triggerIndex];
  if (!trigger) return false;

  // Update trigger fields
  Object.assign(trigger, updates);

  // Mark for UPDATE (unless it's already marked INSERT)
  if (trigger._dmlMethod !== "INSERT") {
    trigger._dmlMethod = "UPDATE";
  }

  draft.modified = true;
  draft.timestamp = Date.now();

  await db.pageDrafts.put(draft);
  console.log(`✅ Trigger updated in component ${compID}`);
  return true;
};

export const removeComponentTrigger = async (pageID, compID, triggerIndex) => {
  const draft = await db.pageDrafts.get(pageID);

  if (!draft) return false;

  const component = draft.components.find(c => c.compID === compID);
  if (!component) return false;

  const trigger = component.triggers[triggerIndex];

  if (trigger.id) {
    // Existing trigger - mark for DELETE
    trigger._dmlMethod = "DELETE";
    console.log(`✅ Trigger marked for DELETE in component ${compID}`);
  } else {
    // New trigger that was never saved - just remove it
    component.triggers.splice(triggerIndex, 1);
    console.log(`✅ Unsaved trigger removed from component ${compID}`);
  }

  draft.modified = true;
  draft.timestamp = Date.now();

  await db.pageDrafts.put(draft);
  return true;
};

export const isDraftModified = async (pageID) => {
  const draft = await db.pageDrafts.get(pageID);
  return draft?.modified || false;
};

export const getPageDraft = async (pageID) => {
  return await db.pageDrafts.get(pageID);
};

export const savePageToMySQL = async (pageID) => {
  const draft = await db.pageDrafts.get(pageID);

  if (!draft) {
    console.error('❌ No draft found for page', pageID);
    return { success: false, error: 'No draft found' };
  }

  if (!draft.modified) {
    console.log('✅ No changes to save');
    return { success: true, message: 'No changes to save' };
  }

  console.log(`💾 Saving changes to MySQL...`);

  const results = {
    operations: [],
    failed: 0,
    errors: []
  };

  for (const component of draft.components) {
    try {
      // 1. Handle component-level DML (INSERT/UPDATE component structure)
      if (component._dmlMethod === "INSERT") {
        await fetch(`${SERVER_URL}/api/execDML`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'INSERT',
            table: 'api_wf.eventComp_xref',
            data: {
              eventID: component.eventID,
              compID: component.compID,
              parentCompID: component.parentCompID,
              sequence: component.sequence,
              props: JSON.stringify(component.props),
              triggers: JSON.stringify(component.triggers.filter(t => t._dmlMethod !== 'DELETE'))
            },
            userID: 'studio'
          })
        });
        results.operations.push(`INSERT component ${component.compID}`);
        component._dmlMethod = null;

      } else if (component._dmlMethod === "UPDATE") {
        await fetch(`${SERVER_URL}/api/execDML`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'UPDATE',
            table: 'api_wf.eventComp_xref',
            primaryKey: { eventID: component.eventID, compID: component.compID },
            data: {
              parentCompID: component.parentCompID,
              sequence: component.sequence
            },
            userID: 'studio'
          })
        });
        results.operations.push(`UPDATE component ${component.compID}`);
        component._dmlMethod = null;
      }

      // 2. Save props if changed
      if (component._propChanges) {
        await fetch(`${SERVER_URL}/api/execDML`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'UPDATE',
            table: 'api_wf.eventComp_xref',
            primaryKey: { eventID: component.eventID, compID: component.compID },
            data: {
              props: JSON.stringify(component.props)
            },
            userID: 'studio'
          })
        });
        results.operations.push(`UPDATE props for component ${component.compID}`);
        component._propChanges = null;
      }

      // 3. Handle trigger DML operations
      const triggersToKeep = [];
      for (const trigger of component.triggers) {
        if (trigger._dmlMethod === "INSERT") {
          const response = await fetch(`${SERVER_URL}/api/execDML`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'INSERT',
              table: 'api_wf.eventTrigger',
              data: {
                xref_id: component.xref_id,
                class: trigger.class,
                action: trigger.action,
                ordr: trigger.ordr || 0,
                content: trigger.content
              },
              userID: 'studio'
            })
          });
          const result = await response.json();
          trigger.id = result.insertId;
          trigger._dmlMethod = null;
          triggersToKeep.push(trigger);
          results.operations.push(`INSERT trigger ${trigger.class} for component ${component.compID}`);

        } else if (trigger._dmlMethod === "UPDATE") {
          await fetch(`${SERVER_URL}/api/execDML`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'UPDATE',
              table: 'api_wf.eventTrigger',
              primaryKey: { id: trigger.id },
              data: {
                class: trigger.class,
                action: trigger.action,
                ordr: trigger.ordr || 0,
                content: trigger.content
              },
              userID: 'studio'
            })
          });
          trigger._dmlMethod = null;
          triggersToKeep.push(trigger);
          results.operations.push(`UPDATE trigger ${trigger.id}`);

        } else if (trigger._dmlMethod === "DELETE") {
          await fetch(`${SERVER_URL}/api/execDML`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'DELETE',
              table: 'api_wf.eventTrigger',
              primaryKey: { id: trigger.id },
              userID: 'studio'
            })
          });
          results.operations.push(`DELETE trigger ${trigger.id}`);
          // Don't keep deleted triggers

        } else {
          // No DML method - unchanged trigger
          triggersToKeep.push(trigger);
        }
      }

      component.triggers = triggersToKeep;

    } catch (error) {
      results.failed++;
      results.errors.push({
        compID: component.compID,
        error: error.message
      });
      console.error(`❌ Failed to save component ${component.compID}:`, error);
    }
  }

  if (results.failed === 0) {
    draft.modified = false;
    draft.timestamp = Date.now();
    await db.pageDrafts.put(draft);
    console.log(`✅ All changes saved: ${results.operations.length} operations`);
  }

  return {
    success: results.failed === 0,
    operations: results.operations,
    failed: results.failed,
    errors: results.errors
  };
};

export const discardPageDraft = async (pageID) => {
  await db.pageDrafts.delete(pageID);
  console.log(`✅ Draft discarded for page ${pageID}`);
  return { success: true };
};

export const generatePageConfigFromDraft = async (pageID) => {
  const draft = await db.pageDrafts.get(pageID);

  if (!draft) {
    console.error('❌ No draft found');
    return null;
  }

  const pageConfig = {
    pageID,
    components: draft.components.map(comp => ({
      id: comp.compID,
      type: comp.comp_type,
      name: comp.comp_name,
      parentID: comp.parentCompID,
      sequence: comp.sequence,
      props: comp.props,
      triggers: comp.triggers
    }))
  };

  return pageConfig;
};
