import { execEvent, execDml } from './api';

export const upsertProp = async (xref_id, paramName, paramVal) => {
  console.log('🔧 upsertProp called:', { xref_id, paramName, paramVal });
  console.log('🔧 paramVal type:', typeof paramVal);
  console.log('🔧 paramVal length:', Array.isArray(paramVal) ? paramVal.length : 'N/A');
  
  const serializedVal = typeof paramVal === 'object'
    ? JSON.stringify(paramVal)
    : String(paramVal);

  console.log('🔧 serializedVal length:', serializedVal.length);

  try {
    const result = await execEvent('pageProps', { xrefID: xref_id });
    // CRITICAL: Filter by xref_id to get props for THIS component only
    const existing = result.data?.find(p => p.xref_id === xref_id && p.paramName === paramName);

    if (existing) {
      await execDml({
        method: 'UPDATE',
        table: 'api_wf.eventProps',
        data: {
          id: existing.prop_id,
          paramVal: serializedVal
        },
        primaryKey: 'id'  // Just pass the column name, value is in data
      });
      console.log(`✅ Updated prop ${paramName} for component ${xref_id}`);
    } else {
      await execDml({
        method: 'INSERT',
        table: 'api_wf.eventProps',
        data: {
          xref_id,
          paramName,
          paramVal: serializedVal
        }
      });
      console.log(`✅ Inserted prop ${paramName} for component ${xref_id}`);
    }
  } catch (error) {
    console.error(`❌ Failed to upsert prop ${paramName}:`, error);
    throw error;
  }
};
