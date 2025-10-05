import { triggerEngine } from '../WorkflowEngine/TriggerEngine.js';

/**
 * Render row from placeholder, replacing {tokens} with data
 */
export function renderRow(placeholder, rowData, idx, onChangeTriggers, rowKey = 'id', renderComponentFn, config, setData) {
  const cloneWithData = (comp) => {
    let textContent = comp.textContent;

    if (textContent && textContent.includes('{')) {
      Object.entries(rowData).forEach(([field, value]) => {
        textContent = textContent.replace(`{${field}}`, value);
      });
    }

    const clonedComp = {
      ...comp,
      id: `${comp.id}_${idx}`,
      key: `${comp.id}_${idx}`,
      textContent,
      components: comp.components?.map(child => cloneWithData(child))
    };

    if (comp.type === 'tr' && onChangeTriggers) {
      const rowValue = rowData[rowKey];

      clonedComp.style = {
        ...(comp.style || {}),
        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f5f5f5',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease'
      };

      clonedComp.props = {
        ...(comp.props || {}),
        _onClick: async (e) => {
          console.log(`🎯 Row clicked: ${rowValue}`, rowData);

          const context = {
            event: e,
            componentId: comp.id,
            this: { value: rowValue },
            selected: rowData,
            rowData: rowData,
            pageConfig: config,
            setData,
            workflowTriggers: { onChange: onChangeTriggers }
          };

          await triggerEngine.executeTriggers(onChangeTriggers, context);
        }
      };
    }

    return clonedComp;
  };

  return renderComponentFn(cloneWithData(placeholder));
}
