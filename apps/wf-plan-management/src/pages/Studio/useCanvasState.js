import { useState } from "react";
import { nanoid } from "nanoid";

export function useCanvasState() {
  const [layout, setLayout] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeSection, setActiveSection] = useState("page");

  const generateMeaningfulId = (type, section) => {
    // Create a base name from type and section
    const typeName = type.toLowerCase();
    const sectionName = section.toLowerCase();

    // Count existing components of this type in this section
    const existingCount = layout.filter(
      (item) => item.type === type && item.section === section
    ).length;

    // Generate meaningful ID
    const suffix = existingCount > 0 ? `${existingCount + 1}` : "";
    return `${sectionName}_${typeName}${suffix}`;
  };

  const addWidget = (type, section = "page") => {
    const id = generateMeaningfulId(type, section);
    
    // Set default size based on component type
    const getDefaultSize = (type) => {
      switch (type) {
        case 'DataGrid': return { width: 250, height: 150 };
        case 'Form': return { width: 200, height: 120 };
        case 'Tabs': return { width: 300, height: 80 };
        case 'Card': return { width: 180, height: 100 };
        default: return { width: 120, height: 60 };
      }
    };
    
    setLayout((l) => [
      ...l,
      {
        id,
        type,
        section,
        bindings: {},
        position: { x: 0, y: 0 },
        size: getDefaultSize(type),
        config: {},
      },
    ]);
    setSelectedId(id);
  };

  const updateWidget = (id, updates) => {
    setLayout((l) =>
      l.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeWidget = (id) => {
    setLayout((l) => l.filter((item) => item.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const moveWidget = (id, newPosition) => {
    setLayout((l) =>
      l.map((item) =>
        item.id === id ? { ...item, position: newPosition } : item
      )
    );
  };

  const resizeWidget = (id, newSize, newPosition) => {
    console.log('🔄 resizeWidget called:', { id, newSize, newPosition });
    setLayout((l) => {
      const updated = l.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, size: newSize, position: newPosition || item.position };
          console.log('✅ Updated item:', updatedItem);
          return updatedItem;
        }
        return item;
      });
      console.log('📊 New layout state:', updated);
      return updated;
    });
  };

  const regenerateAllIds = () => {
    // Group components by section and type to generate meaningful IDs
    const sectionGroups = {};

    // First pass: group components
    layout.forEach((item) => {
      const key = `${item.section}_${item.type}`;
      if (!sectionGroups[key]) {
        sectionGroups[key] = [];
      }
      sectionGroups[key].push(item);
    });

    // Second pass: assign new meaningful IDs
    const updatedLayout = layout.map((item) => {
      const key = `${item.section}_${item.type}`;
      const group = sectionGroups[key];
      const index = group.indexOf(item);

      const typeName = item.type.toLowerCase();
      const sectionName = item.section.toLowerCase();
      const suffix = group.length > 1 ? `${index + 1}` : "";
      const newId = `${sectionName}_${typeName}${suffix}`;

      return { ...item, id: newId };
    });

    setLayout(updatedLayout);
    setSelectedId(null); // Clear selection since IDs changed
  };

  return {
    layout,
    setLayout,
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    resizeWidget,
    selectedId,
    setSelectedId,
    activeSection,
    setActiveSection,
    regenerateAllIds,
  };
}
