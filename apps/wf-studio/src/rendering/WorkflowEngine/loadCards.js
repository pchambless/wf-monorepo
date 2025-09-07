/**
 * Load cards from eventBuilders based on eventType category
 */
export async function loadCards(action, data) {
  try {
    const eventTypeCategory = data.category || action.category || 'generic';
    console.log(`🎴 Loading cards for category: ${eventTypeCategory}`);
    
    // Get template for this category
    const template = await this.getTemplate(eventTypeCategory);
    if (!template?.detailCards) {
      console.warn(`⚠️ No template found for category: ${eventTypeCategory}`);
      return [];
    }

    // Load cards from eventBuilders
    const cards = [];
    for (const cardName of template.detailCards) {
      try {
        const cardModule = await import(`../apps/studio/eventBuilders/cards/${cardName}.js`);
        const cardExport = cardModule[cardName] || cardModule.default;
        if (cardExport) {
          cards.push({ ...cardExport, id: cardName });
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load card ${cardName}:`, error);
      }
    }

    console.log(`✅ Loaded ${cards.length} cards for ${eventTypeCategory}`);
    return cards;
  } catch (error) {
    console.error(`❌ Error loading cards:`, error);
    return [];
  }
}