export default function genTableHtml(tableConfig, sampleData) {
  if (!tableConfig || !tableConfig.columns || tableConfig.columns.length === 0) {
    return '<p><em>No table configuration available for this entity</em></p>';
  }
  
  if (!sampleData || sampleData.length === 0) {
    return '<p><em>No sample data available for table preview</em></p>';
  }
  
  // Generate table headers
  const headers = tableConfig.columns.map(col => 
    `<th>${col.label || col.field}</th>`
  ).join('');
  
  // Generate table rows
  const rows = sampleData.map(record => {
    const cells = tableConfig.columns.map(col => {
      const value = record[col.field] !== undefined && record[col.field] !== null 
        ? record[col.field] 
        : '';
      return `<td>${value}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  return `
<table>
  <thead>
    <tr>${headers}</tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`;
};
