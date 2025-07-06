export default function CanvasItem({ id, type, bindings, onSelect, isSelected }) {
  // Eventually: support dragging, resizing, deletion
  return (
    <div
      className={`canvas-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(id)}
    >
      <strong>{type}</strong>
      <pre>{JSON.stringify(bindings, null, 2)}</pre>
    </div>
  );
}