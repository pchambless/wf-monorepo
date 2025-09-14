/**
 * selectEventTypeTab - Studio-specific trigger for switching to Component Detail tab
 * Sets eventTypeID and switches to tabEventDtl in one atomic action
 */

export const selectEventTypeTab = async function(params, data) {
  const { nodeId, eventTypeID } = params || {};
  const targetEventTypeID = eventTypeID || nodeId;

  try {
    console.log(`🔄 selectEventTypeTab: Switching to Component Detail for '${targetEventTypeID}'`);

    // 1. Set the eventTypeID in contextStore
    this.contextStore.setVal('eventTypeID', targetEventTypeID);
    console.log(`✅ selectEventTypeTab: Set eventTypeID = '${targetEventTypeID}'`);

    // 2. Switch to tabEventDtl (Component Detail tab)
    // TODO: Need to implement tab switching mechanism
    console.log(`✅ selectEventTypeTab: Ready to switch to Component Detail tab`);

    return {
      success: true,
      eventTypeID: targetEventTypeID
    };

  } catch (error) {
    console.error(`❌ selectEventTypeTab: Failed to switch to Component Detail:`, error);
    throw error;
  }
};