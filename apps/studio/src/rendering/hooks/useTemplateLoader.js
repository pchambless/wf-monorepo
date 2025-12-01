import { useState, useEffect } from 'react';

/**
 * Template loading hook
 * Fetches eventType templates from IndexedDB and provides lookup map
 */
export function useTemplateLoader() {
  const [templates, setTemplates] = useState({});
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const { db } = await import('../../db/studioDb.js');
        const eventTypes = await db.eventTypes.toArray();

        const templateMap = {};
        eventTypes.forEach(et => {
          // Parse style if it's a JSON string
          let parsedStyle = et.style;
          if (typeof et.style === 'string') {
            try {
              parsedStyle = JSON.parse(et.style);
            } catch (e) {
              console.warn(`Failed to parse style for ${et.name}:`, e);
            }
          }

          templateMap[et.name] = {
            style: parsedStyle,
            config: et.config,
            category: et.category,
            title: et.title
          };
        });

        console.log('📐 Loaded eventType templates from IndexedDB:', Object.keys(templateMap));
        console.log('📐 Modal template style:', templateMap['Modal']?.style);
        setTemplates(templateMap);
        setTemplatesLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load eventType templates from IndexedDB:', error);
        setTemplatesLoaded(true); // Continue even if load fails
      }
    };

    loadTemplates();
  }, []);

  return { templates, templatesLoaded };
}
