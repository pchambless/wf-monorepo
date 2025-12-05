import { execEvent, execDml } from './api';

export const upsertProp = async (xref_id, paramName, paramVal) => {
  const serializedVal = typeof paramVal === 'object'
    ? JSON.stringify(paramVal)
    : String(paramVal);

  try {
    const result = await execEvent('pageProps', { xrefID: xref_id });
    const existing = result.data?.find(p => p.paramName === paramName);

    if (existing) {
      await execDml({
        method: 'UPDATE',
        table: 'api_wf.eventProps',
        data: {
          id: existing.prop_id,
          paramVal: serializedVal
        },
        primaryKey: { id: existing.prop_id }
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
