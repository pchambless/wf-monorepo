import logger from '../utils/logger.js';

function renderChart(composite, instanceProps = {}, actions = {}) {
  logger.debug(`[renderChart] Rendering Chart: ${instanceProps.id || composite.name}`);

  const props = { ...composite.props, ...instanceProps };
  const id = props.id || 'chart-container';
  const title = props.title || 'Chart';
  const type = props.type || 'bar';

  // Stub: Placeholder for chart - will render using chart.js or similar
  return `
    <div id="${id}" class="chart-container" style="
      padding: 16px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    ">
      <h3 style="margin: 0 0 16px 0; color: #333;">${title}</h3>
      <div style="text-align: center; color: #999;">
        <p>Chart stub (type: ${type})</p>
        <p style="font-size: 12px;">Will render chart visualization when data is provided</p>
      </div>
    </div>
  `;
}

export default renderChart;
