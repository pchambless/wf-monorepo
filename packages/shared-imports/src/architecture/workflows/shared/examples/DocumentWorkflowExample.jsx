/**
 * Document Workflow Integration Example
 * Shows how to integrate createAnalysis/createGuidance with delivery modal
 */

import React, { useState } from "react";
import { createAnalysis, createGuidance } from "../index.js";
import { PostCreationDeliveryModal } from "../../../components/modals/PostCreationDeliveryModal.jsx";
import { useDeliveryModal } from "../hooks/useDeliveryModal.js";
import { Button } from "../../../components/ui/Button.jsx";
import { MultiLineField } from "../../../components/forms/MultiLineField.jsx";

/**
 * Example component showing document workflow integration
 */
export function DocumentWorkflowExample() {
  const [analysisContent, setAnalysisContent] = useState("");
  const [guidanceContent, setGuidanceContent] = useState("");
  const [planId, setPlanId] = useState("19");
  const [topic, setTopic] = useState("example-feature");
  const [isCreating, setIsCreating] = useState(false);

  const {
    modalState,
    hideDeliveryModal,
    showAnalysisDelivery,
    showGuidanceDelivery,
  } = useDeliveryModal();

  /**
   * Create analysis document and show delivery modal
   */
  const handleCreateAnalysis = async () => {
    if (!analysisContent.trim()) return;

    setIsCreating(true);
    try {
      const result = createAnalysis(planId, topic, analysisContent, {
        agent: "Claude",
        architecturalNotes: "Generated from example workflow",
        risks: "Standard implementation risks apply",
        integrationPoints: "Integration with existing system components",
        recommendations: "Follow established patterns and best practices",
      });

      if (result.success) {
        // Show delivery modal for coordination
        showAnalysisDelivery(result, analysisContent);
      } else {
        alert(`Analysis creation failed: ${result.message}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Create guidance document and show delivery modal
   */
  const handleCreateGuidance = async () => {
    if (!guidanceContent.trim()) return;

    setIsCreating(true);
    try {
      const result = createGuidance(planId, topic, guidanceContent, {
        agent: "Claude",
        requirements: "Core requirements for implementation",
        steps: "Step-by-step implementation approach",
        integrationPoints: "Key integration points to consider",
        testing: "Testing strategy and validation approach",
        security: "Security considerations and best practices",
        performance: "Performance optimization guidelines",
      });

      if (result.success) {
        // Show delivery modal for coordination
        showGuidanceDelivery(result, guidanceContent);
      } else {
        alert(`Guidance creation failed: ${result.message}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Document Workflow Example
        </h1>
        <p className="text-gray-600 mt-2">
          Create analysis and guidance documents with multi-directional delivery
          coordination
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

      {/* Analysis Creation */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Create Analysis Document
        </h2>
        <div className="space-y-4">
          <MultiLineField
            label="Analysis Content"
            value={analysisContent}
            onChange={setAnalysisContent}
            placeholder="Enter your analysis content here..."
            rows={6}
          />
          <Button
            onClick={handleCreateAnalysis}
            disabled={!analysisContent.trim() || isCreating}
            variant="primary"
          >
            {isCreating
              ? "Creating..."
              : "Create Analysis & Show Delivery Options"}
          </Button>
        </div>
      </div>

      {/* Guidance Creation */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📝 Create Guidance Document
        </h2>
        <div className="space-y-4">
          <MultiLineField
            label="Guidance Content"
            value={guidanceContent}
            onChange={setGuidanceContent}
            placeholder="Enter your implementation guidance here..."
            rows={6}
          />
          <Button
            onClick={handleCreateGuidance}
            disabled={!guidanceContent.trim() || isCreating}
            variant="primary"
          >
            {isCreating
              ? "Creating..."
              : "Create Guidance & Show Delivery Options"}
          </Button>
        </div>
      </div>

      {/* Delivery Modal */}
      <PostCreationDeliveryModal
        isOpen={modalState.isOpen}
        onClose={hideDeliveryModal}
        documentType={modalState.documentType}
        filePath={modalState.filePath}
        content={modalState.content}
        planId={modalState.planId}
        topic={modalState.topic}
        defaultDeliveryType={modalState.defaultDeliveryType}
      />

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 How This Works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Enter your analysis or guidance content</li>
          <li>
            2. Click create - document is saved to .kiro/NNNN/analysis/ or
            .kiro/NNNN/guidance/
          </li>
          <li>
            3. Delivery modal appears with multi-directional coordination
            options
          </li>
          <li>
            4. Choose delivery method (Claude→Kiro, Kiro→Claude, or User
            coordination)
          </li>
          <li>5. Copy formatted content and paste to target agent</li>
          <li>6. Use coordination checklist to track workflow progress</li>
        </ul>
      </div>
    </div>
  );
}

export default DocumentWorkflowExample;
