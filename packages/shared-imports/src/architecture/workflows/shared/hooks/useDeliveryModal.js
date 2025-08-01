/**
 * Delivery Modal Integration Hook
 * Provides integration between document creation and delivery modal
 */

import { useState, useCallback } from "react";

/**
 * Hook for managing delivery modal state and integration
 * @returns {Object} Modal state and control functions
 */
export function useDeliveryModal() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    documentType: null,
    filePath: null,
    content: null,
    planId: null,
    topic: null,
    defaultDeliveryType: "claude-to-kiro",
  });

  /**
   * Show delivery modal with document details
   * @param {Object} documentDetails - Document creation result
   */
  const showDeliveryModal = useCallback((documentDetails) => {
    const {
      documentType,
      filePath,
      content,
      planId,
      topic,
      component,
      defaultDeliveryType = "claude-to-kiro",
    } = documentDetails;

    setModalState({
      isOpen: true,
      documentType,
      filePath,
      content,
      planId,
      topic: topic || component, // Handle both analysis (topic) and guidance (component)
      defaultDeliveryType,
    });
  }, []);

  /**
   * Hide delivery modal
   */
  const hideDeliveryModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  /**
   * Show modal for analysis document delivery
   * @param {Object} analysisResult - Result from createAnalysis
   * @param {string} content - Original analysis content
   */
  const showAnalysisDelivery = useCallback(
    (analysisResult, content) => {
      if (analysisResult.success) {
        showDeliveryModal({
          documentType: "analysis",
          filePath: analysisResult.filePath,
          content,
          planId: analysisResult.planId,
          topic: analysisResult.topic,
          defaultDeliveryType: "claude-to-kiro",
        });
      }
    },
    [showDeliveryModal]
  );

  /**
   * Show modal for guidance document delivery
   * @param {Object} guidanceResult - Result from createGuidance
   * @param {string} content - Original guidance content
   */
  const showGuidanceDelivery = useCallback(
    (guidanceResult, content) => {
      if (guidanceResult.success) {
        showDeliveryModal({
          documentType: "guidance",
          filePath: guidanceResult.filePath,
          content,
          planId: guidanceResult.planId,
          topic: guidanceResult.component,
          defaultDeliveryType: "kiro-to-claude",
        });
      }
    },
    [showDeliveryModal]
  );

  return {
    modalState,
    showDeliveryModal,
    hideDeliveryModal,
    showAnalysisDelivery,
    showGuidanceDelivery,
  };
}

export default useDeliveryModal;
