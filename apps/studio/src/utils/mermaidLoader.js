/**
 * Mermaid Library Loader for Studio
 * Loads mermaid.js globally once for the entire Studio application
 */

export const loadMermaidLibrary = () => {
  return new Promise((resolve, reject) => {
    // Skip if already loaded
    if (window.mermaid) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';

    script.onload = () => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose', // Allow callbacks
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true
        }
      });

      // Register click callback for mermaid
      window.mermaid.parseError = function(err, hash) {
        console.error('Mermaid parse error:', err);
      };

      console.log('✅ Mermaid.js loaded globally for Studio');
      resolve();
    };

    script.onerror = () => {
      console.error('❌ Failed to load mermaid.js');
      reject(new Error('Failed to load mermaid.js'));
    };

    document.head.appendChild(script);
  });
};