import CanvasItem from './CanvasItem';

export default function WidgetCanvas({ layout, onSelectItem, selectedId }) {
  return (
    <div className="widget-canvas">
      {layout.map(item => (
        <CanvasItem
          key={item.id}
          {...item}
          isSelected={selectedId === item.id}
          onSelect={onSelectItem}
        />
      ))}
    </div>
  );
}