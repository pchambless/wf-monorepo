export default function getCSS() {
  return `<style>
  /* Base styles */
  body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.5; }
  h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
  h2 { color: #3498db; margin-top: 25px; }
  
  /* Layout */
  .preview-container { display: flex; flex-wrap: wrap; gap: 30px; margin-top: 20px; }
  .preview-section { flex: 1; min-width: 400px; border: 1px solid #ddd; border-radius: 5px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  
  /* Toggle controls */
  .controls { margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
  .toggle-btn { background: #4a90e2; color: white; border: none; border-radius: 4px; padding: 8px 15px; margin-right: 10px; cursor: pointer; }
  .toggle-btn:hover { background: #3a7bc8; }
  .toggle-btn.active { background: #2c5e8e; }
  
  /* Directive info */
  .directive-list { margin-top: 20px; background: #f1f8ff; padding: 15px; border-left: 4px solid #3498db; }
  .directive { margin-bottom: 5px; font-family: monospace; }
  
  /* Table styling */
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
  th { background-color: #f6f8fa; font-weight: bold; }
  tr:nth-child(even) { background-color: #f9f9f9; }
  
  /* Form styling */
  .form-container { padding: 10px 0; }
  .form-group { margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
  .group-header { font-size: 1.1em; font-weight: bold; margin-bottom: 10px; color: #555; background: #f5f5f5; padding: 5px; }
  .form-row { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 15px; }
  .form-field { flex: 1; min-width: 200px; }
  label { display: block; font-weight: bold; margin-bottom: 8px; color: #555; }
  .field-preview { padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; }
  .multiLine-field { height: 80px; }
  .select-field { position: relative; }
  .select-field:after { content: "▼"; position: absolute; right: 10px; top: 10px; color: #777; }
  .checkbox-field { display: flex; align-items: center; }
  .checkbox-preview { width: 20px; height: 20px; border: 1px solid #999; border-radius: 3px; margin-right: 10px; }
  .number-field { color: #1565c0; }
  .required-marker { color: #e53935; margin-left: 3px; }
  .field-type { font-size: 0.8em; color: #777; margin-left: 5px; }
  
  /* DML styling */
  .dml-preview { margin-top: 20px; }
  .mapping-section { margin-bottom: 25px; }
  .dml-operation { margin-bottom: 30px; }
  .sql-preview { 
    background: #f5f5f5; 
    padding: 15px; 
    border-left: 4px solid #3498db; 
    font-family: monospace;
    white-space: pre-wrap;
    overflow-x: auto;
  }
</style>`;
}
