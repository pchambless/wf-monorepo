/**
 * getMermaidContent - Studio-specific trigger for loading mermaid diagram content
 * Encapsulates the API call + contextStore storage pattern
 */

export const getMermaidContent = async function(params, data) {
  const { path, storeKey = 'mermaidContent' } = params || {};
  try {
    console.log(`📄 getMermaidContent: Loading ${path}`);

    // Call studioApiCall to get the .mmd file content
    const content = await this.studioApiCall({
      endpoint: 'getDoc',
      params: { path }
    });

    console.log(`📄 getMermaidContent: Loaded ${content?.length || 0} characters`);

    // Store in contextStore
    this.contextStore.setVal(storeKey, content);

    console.log(`✅ getMermaidContent: Stored content in contextStore as '${storeKey}'`);

    return content;
  } catch (error) {
    console.error(`❌ getMermaidContent: Failed to load ${path}:`, error);

    // Set empty content on error so UI doesn't break
    this.contextStore.setVal(storeKey, '');

    throw error;
  }
};