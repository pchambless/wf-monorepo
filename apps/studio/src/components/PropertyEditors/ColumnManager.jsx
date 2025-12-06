import React, { useState } from 'react';

const ColumnManager = ({
  columns,
  onReorder,
  onSelect,
  selectedColumn,
  onDragStart,
  onDragEnd,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    console.log('🎬 Drag start:', index, columns[index].name);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    if (onDragStart) onDragStart();
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    console.log('🎯 Dropping:', { draggedIndex, dropIndex });
    console.log('📋 Original order:', columns.map((c) => c.name).join(', '));

    // Reorder the columns array
    const newColumns = [...columns];
    const [draggedColumn] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(dropIndex, 0, draggedColumn);

    console.log('📋 New order:', newColumns.map((c) => c.name).join(', '));
    console.log('📋 Full new columns array:', JSON.stringify(newColumns, null, 2));

    onReorder(newColumns);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    if (onDragEnd) onDragEnd();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>📊</span>
        <span style={styles.title}>Column Configuration</span>
      </div>
      
      <div style={styles.subtitle}>Select Column</div>
      
      <div style={styles.pillContainer}>
        {columns.map((column, index) => {
          const isSelected = selectedColumn?.name === column.name;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          
          return (
            <div
              key={column.name}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelect(column)}
              style={{
                ...styles.pill,
                ...(isSelected ? styles.pillSelected : {}),
                ...(isDragging ? styles.pillDragging : {}),
                ...(isDragOver ? styles.pillDragOver : {}),
              }}
            >
              <span style={styles.pillDragHandle}>⋮⋮</span>
              <span style={styles.pillText}>{column.name}</span>
              {isSelected && <span style={styles.pillCheck}>●</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  icon: {
    fontSize: '20px',
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  pillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#ffffff',
    border: '2px solid #e2e8f0',
    borderRadius: '20px',
    cursor: 'grab',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    transition: 'all 0.2s',
    userSelect: 'none',
  },
  pillSelected: {
    backgroundColor: '#dbeafe',
    border: '2px solid #3b82f6',
    color: '#1e40af',
    fontWeight: '600',
  },
  pillDragging: {
    opacity: 0.5,
    cursor: 'grabbing',
  },
  pillDragOver: {
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    backgroundColor: '#eff6ff',
  },
  pillDragHandle: {
    fontSize: '10px',
    color: '#94a3b8',
    cursor: 'grab',
  },
  pillText: {
    flex: 1,
  },
  pillCheck: {
    fontSize: '8px',
    color: '#3b82f6',
  },
};

export default ColumnManager;
