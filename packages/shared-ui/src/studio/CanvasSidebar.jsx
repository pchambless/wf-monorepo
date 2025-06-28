const widgetTypes = [
  { type: 'Select', label: 'Selector' },
  { type: 'Table', label: 'Data Table' },
  { type: 'Button', label: 'Action Button' },
  { type: 'Form', label: 'Input Form' }
];

export default function CanvasSidebar({ onAddWidget }) {
  return (
    <div className="canvas-sidebar">
      <h4>🧩 Widgets</h4>
      {widgetTypes.map(w => (
        <button key={w.type} onClick={() => onAddWidget(w.type)}>
          ➕ {w.label}
        </button>
      ))}
    </div>
  );
}