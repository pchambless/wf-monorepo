/**
 * Post Creation Delivery Modal
 * Multi-directional agent coordination system for document delivery
 * Handles Claude ↔ User ↔ Kiro communication workflows
 *
 * NOTE: This is a browser-safe component that doesn't import server-side utilities
 */

import React, { useState } from "react";

/**
 * Format content for Kiro delivery (Claude analysis → Kiro implementation)
 */
function formatForKiroDelivery(content, filePath, documentType) {
  return `📊 ${
    documentType === "analysis" ? "Analysis" : "Document"
  } Ready for Implementation

Document: ${filePath}

${content}

🎯 Action Required: Please review this analysis and proceed with implementation following the architectural guidance provided.

📋 Implementation Checklist:
- [ ] Review architectural considerations
- [ ] Assess implementation risks
- [ ] Identify integration points
- [ ] Follow provided recommendations
- [ ] Create implementation plan`;
}

/**
 * Format content for Claude delivery (Kiro guidance → Claude review)
 */
function formatForClaudeDelivery(content, filePath, documentType) {
  return `📝 ${
    documentType === "guidance" ? "Implementation Guidance" : "Document"
  } for Review

Document: ${filePath}

${content}

🔍 Review Request: Please review this implementation approach and provide any architectural feedback or concerns.

📋 Review Checklist:
- [ ] Architectural alignment verified
- [ ] Security considerations addressed
- [ ] Performance implications assessed
- [ ] Integration approach validated
- [ ] Recommendations provided`;
}

/**
 * Format content for user coordination
 */
function formatForUserCoordination(content, filePath, documentType) {
  const timestamp = new Date().toISOString();

  return `🤝 Agent Coordination Package

Document Type: ${documentType}
Document Path: ${filePath}
Created: ${timestamp}

Content:
${content}

📋 Coordination Workflow:
- [ ] Document created successfully
- [ ] Content reviewed for accuracy
- [ ] Target agent identified
- [ ] Delivery format selected
- [ ] Content delivered to agent
- [ ] Response/acknowledgment received
- [ ] Next steps identified
- [ ] Workflow status updated

💡 Coordination Notes:
Add any specific instructions or context for the receiving agent here.`;
}

/**
 * Multi-directional delivery modal component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.documentType - Type of document (analysis, guidance)
 * @param {string} props.filePath - Path to created document
 * @param {string} props.content - Document content
 * @param {string} props.planId - Plan ID
 * @param {string} props.topic - Document topic
 * @param {string} props.defaultDeliveryType - Default delivery type
 */
export function PostCreationDeliveryModal({
  isOpen,
  onClose,
  documentType,
  filePath,
  content,
  planId,
  topic,
  defaultDeliveryType = "claude-to-kiro",
}) {
  const [selectedDeliveryType, setSelectedDeliveryType] =
    useState(defaultDeliveryType);
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  // Define delivery options based on document type and context
  const deliveryOptions = {
    "claude-to-kiro": {
      title: "📊 Deliver to Kiro",
      subtitle: "Analysis → Implementation",
      description: "Format this document for Kiro to implement",
      format: formatForKiroDelivery(content, filePath, documentType),
      buttonText: "Copy for Kiro",
      instructions: "Copy this content and paste it to Kiro for implementation",
    },

    "kiro-to-claude": {
      title: "📝 Deliver to Claude",
      subtitle: "Guidance → Review",
      description: "Format this document for Claude to review",
      format: formatForClaudeDelivery(content, filePath, documentType),
      buttonText: "Copy for Claude",
      instructions:
        "Copy this content and paste it to Claude for architectural review",
    },

    "user-coordination": {
      title: "🤝 Coordination Package",
      subtitle: "Manual Coordination",
      description: "Complete coordination package for manual agent management",
      format: formatForUserCoordination(content, filePath, documentType),
      buttonText: "Copy Coordination Package",
      instructions: "Use this package for manual coordination between agents",
    },
  };

  const currentOption = deliveryOptions[selectedDeliveryType];

  /**
   * Copy content to clipboard with fallback support
   */
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentOption.format);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = currentOption.format;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setCopyStatus("✅ Copied to clipboard!");

      // Reset status after 3 seconds
      setTimeout(() => {
        setCopied(false);
        setCopyStatus("");
      }, 3000);
    } catch (error) {
      setCopyStatus("❌ Copy failed - please select and copy manually");
      setTimeout(() => setCopyStatus(""), 3000);
    }
  };

  if (!isOpen) return null;

  // Simple modal implementation (replace with your actual Modal component)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Document Delivery Assistant</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">Document Created</h3>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Type:</strong> {documentType} | <strong>Plan:</strong>{" "}
              {planId} | <strong>Topic:</strong> {topic}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <strong>Path:</strong> {filePath}
            </p>
          </div>

          {/* Delivery Type Selector */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Choose Delivery Method
            </h4>
            <div className="space-y-2">
              {Object.entries(deliveryOptions).map(([key, option]) => (
                <label
                  key={key}
                  className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    value={key}
                    checked={selectedDeliveryType === key}
                    onChange={(e) => setSelectedDeliveryType(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {option.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.subtitle}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Formatted Content Display */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Formatted Content
            </h4>
            <textarea
              value={currentOption.format}
              readOnly
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
            />
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> {currentOption.instructions}
            </p>
          </div>

          {/* Copy Status */}
          {copyStatus && (
            <div className="text-center">
              <p className="text-sm font-medium">{copyStatus}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={copyToClipboard}
              disabled={copied}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {copied ? "✅ Copied!" : currentOption.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCreationDeliveryModal;
