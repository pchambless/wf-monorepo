/**
 * Refresh target components via context signaling
 */
export async function refresh(content, context) {
  const { setVals } = await import('@whatsfresh/shared-imports');

  // content is an array of component names
  const values = content.map(target => ({
    paramName: `${target}_refresh_signal`,
    paramVal: Date.now() // Timestamp to trigger refresh
  }));

  return await setVals(values);
}