import { useState } from 'react';
import { nanoid } from 'nanoid';

export function useCanvasState() {
  const [layout, setLayout] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const addWidget = type => {
    const id = `w_${nanoid(6)}`;
    setLayout(l => [...l, { id, type, bindings: {} }]);
    setSelectedId(id);
  };

  return { layout, addWidget, selectedId, setSelectedId };
}