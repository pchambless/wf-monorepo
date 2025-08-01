/**
 * Impact Tracking Integration Example
 * Shows how to integrate createPlanImpact with document creation workflows
 */

import React, { useState } from "react";
import { execCreateDoc } from "@whatsfresh/shared-imports/api";
import {
  createPlanImpact,
  trackDocumentCreation,
} from "@whatsfresh/shared-imports/architecture/workflows/plans";
import { PostCreationDeliveryModal } from "@whatsfresh/shared-imports/components";

/**
 * Document creation with automatic impact tracking
 */
export function ImpactTrackingExample() {
  const [content, setContent] = useState("");
  const [planId, setPlanId] = useState("19");
  const [topic, setTopic] = useState("impact-tracking-demo");
  const [isCreating, setIsCreating] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [impactLog, setImpactLog] = useState([]);

  /**
   * Create document with automatic impact tracking
   */
  const handleCreateWithTracking = async (template, agent = "claude") => {
    if (!content.trim()) return;

    setIsCreating(true);
    try {
      // Step 1: Create document
      const docResult = await execCreateDoc({
        targetPath: ".kiro/:planId/analysis/",
        fileName: ":agent-analysis-:topic.md",
        template,
        planId,
        topic,
        content,
        agent,
        docID: planId, // Database-first approach
      });

      if (docResult.success) {
        // Step 2: Track impact automatically
        const impactResult = await trackDocumentCreation(
          docResult,
          planId,
          agent,
          `Created ${template} analysis for Plan ${planId} impact tracking demo`
        );

        // Update impact log
        if (impactResult.success) {
          setImpactLog((prev) => [
            ...prev,
            {
              timestamp: new Date().toISOString(),
              type: "Document Creation",
              file: docResult.resolvedFileName,
              agent,
              status: "tracked",
            },
          ]);
        }

        // Step 3: Show delivery modal
        setModalData({
          isOpen: true,
          documentType: "analysis",
          filePath: docResult.fullPath,
          content: content,
          planId: planId,
          topic: topic,
          defaultDeliveryType: "claude-to-kiro",
        });
      } else {
        alert(`Document creation failed: ${docResult.message}`);
      }
    } catch (error) {
      alert(`Workflow failed: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Manual impact tracking for implementation changes
   */
  const handleTrackImplementation = async () => {
    try {
      const impactResult = await createPlanImpact({
        planId,
        filePath: "apps/wf-server/server/controller/execCreateDoc.js",
        changeType: "MODIFY",
        description:
          "Enhanced execCreateDoc controller with impact tracking integration",
        agent: "kiro",
        metadata: {
          feature: "impact-tracking",
          workflow: "document-creation",
        },
      });

      if (impactResult.success) {
        setImpactLog((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            type: "Implementation",
            file: "execCreateDoc.js",
            agent: "kiro",
            status: "tracked",
          },
        ]);
        alert("Implementation impact tracked successfully!");
      } else {
        alert(`Impact tracking failed: ${impactResult.message}`);
      }
    } catch (error) {
      alert(`Impact tracking error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Document Creation + Impact Tracking
        </h1>
        <p className="text-gray-600 mt-2">
          Database-first workflow with automatic audit trail
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
            placeholder="impact-tracking-demo"
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
          placeholder="Enter analysis content for impact tracking demo..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleCreateWithTracking("analysisTemplate", "claude")}
          disabled={!content.trim() || isCreating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "📊 Create Analysis + Track Impact"}
        </button>
        <button
          onClick={handleTrackImplementation}
          disabled={isCreating}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          🔧 Track Implementation Impact
        </button>
      </div>

      {/* Impact Log */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          📊 Plan Impact Audit Trail
        </h3>
        {impactLog.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No impacts tracked yet. Create a document or track implementation to
            see audit trail.
          </p>
        ) : (
          <div className="space-y-2">
            {impactLog.map((impact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div>
                  <span className="font-medium text-gray-900">
                    {impact.type}
                  </span>
                  <span className="text-gray-600 ml-2">{impact.file}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{impact.agent}</div>
                  <div className="text-xs text-green-600">{impact.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Modal */}
      {modalData && (
        <PostCreationDeliveryModal
          {...modalData}
          onClose={() => setModalData(null)}
        />
      )}

      {/* Workflow Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          🎯 Database-First Workflow
        </h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Document created via execCreateDoc with DocID linking</li>
          <li>Impact automatically tracked in api_wf.plan_impacts table</li>
          <li>Complete audit trail maintained for all plan-related changes</li>
          <li>
            Modular design - impact tracking separate from document creation
          </li>
          <li>Works for any agent (Claude, Kiro, User) and any file type</li>
        </ol>
      </div>
    </div>
  );
}

export default ImpactTrackingExample;
