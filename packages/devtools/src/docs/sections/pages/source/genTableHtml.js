export default function genTableHtml(tableConfig, sampleData) {
  if (!tableConfig) {
    return '<p><em>No table configuration available for this entity</em></p>';
  }

  // Show table configuration details even if columns are empty
  const configInfo = `
    <div class="table-config-info" style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
      <h4>Table Configuration</h4>
      <p><strong>Columns defined:</strong> ${tableConfig.columns ? tableConfig.columns.length : 0}</p>
      ${tableConfig.columns && tableConfig.columns.length > 0 ? `
        <details>
          <summary>Column Details</summary>
          <table style="margin: 0.5rem 0; font-size: 0.9em;">
            <thead>
              <tr><th>Field</th><th>Label</th><th>Type</th><th>Width</th><th>Editable</th><th>Hidden</th></tr>
            </thead>
            <tbody>
              ${tableConfig.columns.map(col => `
                <tr>
                  <td><code>${col.field}</code></td>
                  <td>${col.label || col.field}</td>
                  <td>${col.type || 'text'}</td>
                  <td>${col.width || 'auto'}</td>
                  <td>${col.editable ? 'Yes' : 'No'}</td>
                  <td>${col.hidden ? 'Yes' : 'No'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </details>
      ` : '<p><em>No columns defined in tableConfig</em></p>'}
    </div>
  `;

  if (!tableConfig.columns || tableConfig.columns.length === 0) {
    return configInfo + '<p><em>Cannot preview table: no columns configured</em></p>';
  }

  if (!sampleData || sampleData.length === 0) {
    return configInfo + '<p><em>No sample data available for table preview</em></p>';
  }

  // Generate table headers
  const headers = tableConfig.columns
    .filter(col => !col.hidden)
    .map(col => `<th>${col.label || col.field}</th>`)
    .join('');

  // Generate table rows
  const rows = sampleData.map(record => {
    const cells = tableConfig.columns
      .filter(col => !col.hidden)
      .map(col => {
        const value = record[col.field] !== undefined && record[col.field] !== null
          ? record[col.field]
          : '';
        return `<td>${value}</td>`;
      }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return configInfo + `
<table>
  <thead>
    <tr>${headers}</tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`;
};
