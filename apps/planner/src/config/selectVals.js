/**
 * Plan Management Select Values
 * Local configuration for dropdown/select options
 */

const selectVals = {
  planStatus: {
    name: "Plan Status",
    description: "Status options for plans",
    choices: [
      { id: "pending", label: "Pending", ordr: 1 },
      { id: "active", label: "Active", ordr: 2 }, 
      { id: "completed", label: "Completed", ordr: 3 },
      { id: "cancelled", label: "Cancelled", ordr: 4 },
      { id: "on-hold", label: "On Hold", ordr: 5 }
    ]
  }
};

/**
 * Get configuration choices by key
 * @param {string} configKey - Configuration key (e.g., 'planStatus')
 * @param {Object} options - Options for data processing
 * @param {boolean} options.sortByOrder - Sort by 'ordr' field (default: true)
 * @returns {Array} Configuration choices
 */
export function getConfigChoices(configKey, options = {}) {
  const { sortByOrder = true } = options;

  try {
    const config = selectVals[configKey];
    
    if (!config) {
      console.warn(`Config key '${configKey}' not found`);
      return [];
    }

    let choices = [...config.choices];

    if (sortByOrder) {
      choices.sort((a, b) => (a.ordr || 0) - (b.ordr || 0));
    }

    return choices;
    
  } catch (error) {
    console.error(`Error getting config choices for '${configKey}':`, error);
    return [];
  }
}

export default selectVals;