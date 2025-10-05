import React from 'react';

/**
 * EventPreviewView - Display component for showing generated/preview eventType with diff highlighting
 * Shows git-style diff between current and generated eventType structures
 */
const EventPreviewView = ({ currentEventType, generatedEventType, title = "Preview EventType" }) => {
  
  // Simple diff calculation - compares stringified versions
  const generateDiff = (current, generated) => {
    if (!current || !generated) return [];
    
    const currentLines = formatAsExport(current).split('\n');
    const generatedLines = formatAsExport(generated).split('\n');
    
    const diff = [];
    const maxLines = Math.max(currentLines.length, generatedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const currentLine = currentLines[i] || '';
      const generatedLine = generatedLines[i] || '';
      
      if (currentLine !== generatedLine) {
        if (currentLine && !generatedLine) {
          diff.push({ type: 'removed', content: currentLine, lineNum: i + 1 });
        } else if (!currentLine && generatedLine) {
          diff.push({ type: 'added', content: generatedLine, lineNum: i + 1 });
        } else if (currentLine !== generatedLine) {
          diff.push({ type: 'removed', content: currentLine, lineNum: i + 1 });
          diff.push({ type: 'added', content: generatedLine, lineNum: i + 1 });
        }
      } else if (currentLine) {
        diff.push({ type: 'unchanged', content: currentLine, lineNum: i + 1 });
      }
    }
    
    return diff;
  };
  
  // Format eventType object as JavaScript export
  const formatAsExport = (data) => {
    if (!data) return 'No eventType data';
    
    const eventTypeName = data.eventType || data.title?.replace(/\s+/g, '') || 'eventType';
    const objectString = JSON.stringify(data, null, 2)
      .replace(/"/g, '') // Remove quotes around keys
      .replace(/: /g, ': ') // Clean formatting
      .replace(/\n/g, '\n  '); // Proper indentation
    
    return `export const ${eventTypeName} = ${objectString};`;
  };

  const diff = generateDiff(currentEventType, generatedEventType);
  
  return (
    <div className="event-preview-view">
      <div className="view-header">
        <h4>{title}</h4>
        <span className="file-indicator">📄 {generatedEventType?.eventType || 'eventType'}.js (Preview)</span>
        <div className="diff-stats">
          <span className="additions">+{diff.filter(d => d.type === 'added').length}</span>
          <span className="deletions">-{diff.filter(d => d.type === 'removed').length}</span>
        </div>
      </div>
      
      <div className="diff-display">
        <div className="diff-content">
          {diff.map((line, index) => (
            <div key={index} className={`diff-line ${line.type}`}>
              <span className="line-number">{line.lineNum}</span>
              <span className="line-marker">
                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
              </span>
              <span className="line-content">{line.content}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="view-footer">
        <span className="preview-note">
          🔍 Preview shows changes that will be applied to the eventType file
        </span>
      </div>
    </div>
  );
};

export default EventPreviewView;