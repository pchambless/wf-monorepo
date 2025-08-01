import React, { createContext, useContext, useState, useEffect } from "react";
import contextStore from "../stores/contextStore.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("PlanContext");

// Create the plan context
const PlanContext = createContext(null);

/**
 * Plan Context Provider
 * Manages plan-dependent component state and refresh triggers
 */
export const PlanContextProvider = ({ children }) => {
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Initialize with current planID from contextStore
    const initialPlanId = contextStore.getParameter("planID");
    setCurrentPlanId(initialPlanId);
    log.debug("PlanContextProvider initialized", { initialPlanId });

    // Subscribe to planID changes
    const unsubscribe = contextStore.subscribe(
      "planID",
      (newPlanId, oldPlanId) => {
        log.debug("Plan context change detected", { newPlanId, oldPlanId });

        if (newPlanId !== oldPlanId) {
          setCurrentPlanId(newPlanId);
          setRefreshTrigger((prev) => prev + 1);
          log.info("Plan context updated, refresh triggered", {
            newPlanId,
            refreshTrigger: refreshTrigger + 1,
          });
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      log.debug("PlanContextProvider unmounting, cleaning up subscription");
      unsubscribe();
    };
  }, []);

  const contextValue = {
    currentPlanId,
    isLoading,
    refreshTrigger,
    setIsLoading,
    triggerRefresh: () => {
      log.debug("Manual refresh triggered");
      setRefreshTrigger((prev) => prev + 1);
    },
  };

  return (
    <PlanContext.Provider value={contextValue}>{children}</PlanContext.Provider>
  );
};

/**
 * Custom hook for plan-dependent components
 * Provides plan context and handles automatic refresh
 */
export const usePlanContext = (refreshCallback) => {
  const context = useContext(PlanContext);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!context) {
    throw new Error("usePlanContext must be used within a PlanContextProvider");
  }

  useEffect(() => {
    if (
      context.refreshTrigger > 0 &&
      refreshCallback &&
      context.currentPlanId
    ) {
      log.debug("Executing refresh callback", {
        planId: context.currentPlanId,
        refreshTrigger: context.refreshTrigger,
      });

      setIsRefreshing(true);

      // Execute the refresh callback
      const refreshPromise = refreshCallback(context.currentPlanId);

      // Handle both promise and non-promise returns
      if (refreshPromise && typeof refreshPromise.then === "function") {
        refreshPromise
          .then(() => {
            log.debug("Refresh callback completed successfully");
          })
          .catch((error) => {
            log.error("Refresh callback failed", error);
          })
          .finally(() => {
            setIsRefreshing(false);
          });
      } else {
        // Non-promise return, assume synchronous completion
        setIsRefreshing(false);
        log.debug("Synchronous refresh callback completed");
      }
    }
  }, [context.refreshTrigger, refreshCallback, context.currentPlanId]);

  return {
    ...context,
    isRefreshing,
  };
};

export default PlanContext;
