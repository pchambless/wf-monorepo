import { useState, useEffect } from 'react';

/**
 * Template loading hook
 * Fetches eventType templates from API and provides lookup map
 */
export function useTemplateLoader() {
  const [templates, setTemplates] = useState({});
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const { createApiUrl } = await import('../../config/api.js');
        const response = await fetch(createApiUrl('/api/eventTypes'));
        const eventTypes = await response.json();

        const templateMap = {};
        eventTypes.forEach(et => {
          templateMap[et.name] = {
            style: et.style,
            config: et.config,
            category: et.category,
            title: et.title
          };
        });

        console.log('📐 Loaded eventType templates:', Object.keys(templateMap));
        setTemplates(templateMap);
        setTemplatesLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load eventType templates:', error);
        setTemplatesLoaded(true); // Continue even if load fails
      }
    };

    loadTemplates();
  }, []);

  return { templates, templatesLoaded };
}
