/**
 * Execute DML operation (INSERT/UPDATE/DELETE) via shared-imports
 */
export async function execDML(content, context) {
  const { execDml } = await import('@whatsfresh/shared-imports');

  // Content should have: {method, table, data}
  // Merge form data with content
  const dmlRequest = {
    method: content.method,
    table: content.table,
    data: context.formData || content.data || {}
  };

  console.log('💾 execDML:', dmlRequest);
  return await execDml(dmlRequest);
}
