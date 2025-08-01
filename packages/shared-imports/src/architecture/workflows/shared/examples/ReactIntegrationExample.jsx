/**
 * React Integration Example for execCreateDoc API
 * Shows complete workflow from React component to document creation with delivery modal
 */

import React, { useState } from "react";
import { execCreateDoc } from "@whatsfresh/shared-imports/api";
import { PostCreationDeliveryModal } from "@whatsfresh/shared-imports/components";

/**
 * Complete React integration example
 */
export function ReactIntegrationExample() {
  const [content, setContent] = useState("");
  const [planId, setPlanId] = useState("19");
  const [topic, setTopic] = useState("example-feature");
  const [isCreating, setIsCreating] = useState(false);
  const [modalData, setModalData] = useState(null);

  /**
   * Create analysis document and show delivery modal
   */
  const handleCreateAnalysis = async () => {
    if (!content.trim()) return;

    setIsCreating(true);
    try {
      // Call the execCreateDoc API
      const result = await execCreateDoc("createAnalysis", {
        planId,
        topic,
        content,
        options: {
          agent: "Claude",
          architecturalNotes: "Generated from React component",
          risks: "Standard implementation risks apply",
          integrationPoints: "React UI, API client, server controller",
          recommendations: "Follow established patterns and best practices",
        },
      });

      if (result.success) {
        // Show delivery modal for coordination
        setModalData({
          isOpen: true,
          documentType: "analysis",
          filePath: result.filePath,
          content: content,
          planId: result.planId,
          topic: result.topic,
          defaultDeliveryType: "claude-to-kiro",
        });
      } else {
        alert(`Analysis creation failed: ${result.message}`);
      }
    } catch (error) {
      alert(`API call failed: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Create guidance document and show delivery modal
   */
  const handleCreateGuidance = async () => {
    if (!content.trim()) return;

    setIsCreating(true);
    try {
      // Call the execCreateDoc API
      const result = await execCreateDoc("createGuidance", {
        planId,
        topic, // Used as component name for guidance
        content,
        options: {
          agent: "Claude",
          requirements: "Core requirements for implementation",
          steps: "Step-by-step implementation approach",
          integrationPoints: "Key integration points to consider",
          testing: "Testing strategy and validation approach",
          security: "Security considerations and best practices",
          performance: "Performance optimization guidelines",
        },
      });

      if (result.success) {
        // Show delivery modal for coordination
        setModalData({
          isOpen: true,
          documentType: "guidance",
          filePath: result.filePath,
          content: content,
          planId: result.planId,
          topic: result.component || result.topic,
          defaultDeliveryType: "kiro-to-claude",
        });
      } else {
        alert(`Guidance creation failed: ${result.message}`);
      }
    } catch (error) {
      alert(`API call failed: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          execCreateDoc React Integration
        </h1>
        <p className="text-gray-600 mt-2">
          Complete workflow: React → API → Server → Document → Delivery Modal
        </p>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan ID
          </label>
          <input
            type="text"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="19"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic/Component
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="example-feature"
          />
        </div>
      </div>

      {/* Content Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your document content here..."
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleCreateAnalysis}
          disabled={!content.trim() || isCreating}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "📊 Create Analysis & Show Delivery"}
        </button>
        <button
          onClick={handleCreateGuidance}
          disabled={!content.trim() || isCreating}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "📝 Create Guidance & Show Delivery"}
        </button>
      </div>

      {/* Delivery Modal */}
      {modalData && (
        <PostCreationDeliveryModal
          {...modalData}
          onClose={() => setModalData(null)}
        />
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          🎯 Complete Workflow
        </h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>User enters content and clicks create button</li>
          <li>
            React component calls <code>execCreateDoc()</code> API function
          </li>
          <li>
            API makes POST request to <code>/api/execCreateDoc</code> endpoint
          </li>
          <li>
            Server controller routes to appropriate document creation function
          </li>
          <li>
            Document is created in file system (.kiro/NNNN/analysis/ or
            .kiro/NNNN/guidance/)
          </li>
          <li>Success response returned to React component</li>
          <li>
            PostCreationDeliveryModal appears with multi-directional
            coordination options
          </li>
          <li>
            User selects delivery method and copies formatted content for agent
            coordination
          </li>
        </ol>
      </div>

      {/* API Usage Code */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2">💻 API Usage Code</h3>
        <pre className="text-sm text-gray-800 overflow-x-auto">
          {`import { execCreateDoc } from '@whatsfresh/shared-imports/api';

// Create analysis document
const result = await execCreateDoc('createAnalysis', {
  planId: 19,
  topic: 'my-feature',
  content: 'Analysis content...',
  options: { agent: 'Claude' }
});

// Create guidance document  
const result = await execCreateDoc('createGuidance', {
  planId: 19,
  topic: 'my-component',
  content: 'Implementation guidance...',
  options: { agent: 'Claude' }
});`}
        </pre>
      </div>
    </div>
  );
}

export default ReactIntegrationExample;
