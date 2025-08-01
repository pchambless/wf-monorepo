/**
 * Parameter-Driven execCreateDoc Example
 * Shows the new universal approach following DML pattern
 */

import React, { useState } from "react";
import { execCreateDoc } from "@whatsfresh/shared-imports/api";
import { PostCreationDeliveryModal } from "@whatsfresh/shared-imports/components";

/**
 * Parameter-driven document creation example
 */
export function ParameterDrivenExample() {
  const [content, setContent] = useState("");
  const [planId, setPlanId] = useState("19");
  const [topic, setTopic] = useState("example-feature");
  const [isCreating, setIsCreating] = useState(false);
  const [modalData, setModalData] = useState(null);

  /**
   * Create analysis document using parameter-driven approach
   */
  const handleCreateAnalysis = async () => {
    if (!content.trim()) return;

    setIsCreating(true);
    try {
      // Parameter-driven API call
      const result = await execCreateDoc({
        targetPath: ".kiro/:planId/analysis/",
        fileName: ":agent-analysis-:topic.md",
        template: "analysisTemplate",
        planId,
        topic,
        content,
        agent: "claude",
        architecturalNotes: "Generated from React component",
        risks: "Standard implementation risks apply",
        integrationPoints: "React UI, API client, server controller",
        recommendations: "Follow established patterns and best practices",
      });

      if (result.success) {
        setModalData({
          isOpen: true,
          documentType: "analysis",
          filePath: result.fullPath,
          content: content,
          planId: planId,
          topic: topic,
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
   * Create guidance document using parameter-driven approach
   */
  const handleCreateGuidance = async () => {
    if (!content.trim()) return;

    setIsCreating(true);
    try {
      // Parameter-driven API call
      const result = await execCreateDoc({
        targetPath: ".kiro/:planId/guidance/",
        fileName: "implementation-guidance-:topic.md",
        template: "guidanceTemplate",
        planId,
        topic,
        content,
        agent: "claude",
        requirements: "Core requirements for implementation",
        steps: "Step-by-step implementation approach",
        integrationPoints: "Key integration points to consider",
        testing: "Testing strategy and validation approach",
        security: "Security considerations and best practices",
        performance: "Performance optimization guidelines",
      });

      if (result.success) {
        setModalData({
          isOpen: true,
          documentType: "guidance",
          filePath: result.fullPath,
          content: content,
          planId: planId,
          topic: topic,
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

  /**
   * Create custom document anywhere with any filename
   */
  const handleCreateCustom = async () => {
    if (!content.trim()) return;

    setIsCreating(true);
    try {
      // Completely flexible parameter-driven approach
      const result = await execCreateDoc({
        targetPath: "./custom-docs/:planId/",
        fileName: "custom-:topic-:timestamp.md",
        content, // No template - use raw content
        planId,
        topic,
        timestamp: Date.now(),
      });

      if (result.success) {
        alert(`Custom document created: ${result.resolvedFileName}`);
      } else {
        alert(`Custom creation failed: ${result.message}`);
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
          Parameter-Driven Document Creation
        </h1>
        <p className="text-gray-600 mt-2">
          Universal approach - any file type, anywhere, with parameter
          substitution
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
            Topic
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
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={handleCreateAnalysis}
          disabled={!content.trim() || isCreating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          📊 Analysis Template
        </button>
        <button
          onClick={handleCreateGuidance}
          disabled={!content.trim() || isCreating}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          📝 Guidance Template
        </button>
        <button
          onClick={handleCreateCustom}
          disabled={!content.trim() || isCreating}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          🎯 Custom Document
        </button>
      </div>

      {/* Delivery Modal */}
      {modalData && (
        <PostCreationDeliveryModal
          {...modalData}
          onClose={() => setModalData(null)}
        />
      )}

      {/* Usage Examples */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          🎯 Parameter-Driven Examples
        </h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800">Analysis Document:</h4>
            <pre className="text-blue-700 bg-blue-100 p-2 rounded mt-1 overflow-x-auto">
              {`execCreateDoc({
  targetPath: '.kiro/:planId/analysis/',
  fileName: ':agent-analysis-:topic.md',
  template: 'analysisTemplate',
  planId: 19,
  topic: 'my-feature',
  content: 'Analysis content...',
  agent: 'claude'
})`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-blue-800">Custom Document:</h4>
            <pre className="text-blue-700 bg-blue-100 p-2 rounded mt-1 overflow-x-auto">
              {`execCreateDoc({
  targetPath: './anywhere/:planId/',
  fileName: 'custom-:topic-:timestamp.md',
  content: 'Raw content...',
  planId: 19,
  topic: 'anything',
  timestamp: Date.now()
})`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParameterDrivenExample;
