/**
 * Plan Management Workflow Map - Phase 4: Complete Configuration
 * Full workflow configuration with page-level triggers and component integration
 */

import { executeWorkflows } from "@whatsfresh/shared-imports/workflows/eventType";

export const planManagementWorkflowMap = {
  pageId: "plan-management",
  title: "Plan Management",
  layout: "master-detail",

  // Page-level workflow triggers
  workflowTriggers: {
    onPageLoad: ["initializePage", "loadUserPreferences", "validateAccess"],
    onPlanSelect: ["validatePlanAccess", "loadPlanContext", "trackPlanView"],
    onPageExit: ["saveUserPreferences", "cleanupResources", "trackPageExit"],
  },

  // Page-level configuration
  pageConfig: {
    title: "Plan Management",
    permissions: ["plans.read", "plans.write"],
    refreshInterval: 30000, // 30 seconds
    autoSave: true,
    confirmExit: true,
  },

  // Enhanced page structure definition
  structure: {
    header: {
      component: "SelStatusWidget",
      eventType: "SelPlanStatus",
      props: {
        configSource: "planStatus",
        filterTarget: "planList",
        showCounts: true,
        showAllOption: true,
      },
      workflows: {
        onLoad: ["loadStatusOptions"],
        onChange: ["filterPlans", "trackStatusFilter"],
      },
    },
    master: {
      component: "PlanList",
      eventType: "planList",
      props: {
        displayFormat: "NNNN-name",
        selectable: true,
        sortable: true,
        searchable: true,
      },
      workflows: {
        onLoad: ["loadPlans", "applyDefaultFilter"],
        onSelect: ["validateAccess", "loadPlanDetail", "trackSelection"],
        onRefresh: ["refreshPlanList", "updateCounts"],
      },
    },
    detail: {
      component: "PlanDetailTabs",
      tabs: [
        { id: "plan-detail", tabMap: "plan-detail" },
        { id: "communications", tabMap: "communications" },
        { id: "impacts", tabMap: "impacts" },
      ],
      props: {
        tabPosition: "top",
        lazy: true, // Load tab content on demand
        cacheable: true,
      },
      workflows: {
        onTabChange: ["loadTabContent", "trackTabView"],
        onDataChange: ["validateData", "trackChanges", "autoSave"],
      },
    },
  },

  // Error handling configuration
  errorHandling: {
    strategy: "graceful",
    showUserFriendlyMessages: true,
    logErrors: true,
    retryFailedOperations: true,
    fallbackBehavior: "showCachedData",
  },

  // Performance configuration
  performance: {
    enableVirtualization: true,
    lazyLoadTabs: true,
    cacheStrategy: "memory",
    debounceSearch: 300,
    throttleRefresh: 1000,
  },

  // Phase 4: Real workflow execution
  async executePageWorkflow(trigger, context = {}) {
    console.log(`Phase 4: Executing page workflow: ${trigger}`);

    try {
      const workflows = this.workflowTriggers[trigger] || [];

      if (workflows.length === 0) {
        console.log(`No workflows configured for trigger: ${trigger}`);
        return { success: true, message: `No workflows for ${trigger}` };
      }

      // Execute workflows using the established system
      const result = await executeWorkflows("plan-management", trigger, {
        ...context,
        pageId: this.pageId,
        timestamp: new Date().toISOString(),
      });

      console.log(`Page workflow ${trigger} completed:`, result);
      return result;
    } catch (error) {
      console.error(`Page workflow ${trigger} failed:`, error);
      return {
        success: false,
        error: error.message,
        trigger,
        pageId: this.pageId,
      };
    }
  },

  // Enhanced tab configuration loader
  async getTabMap(tabId) {
    const tabMaps = {
      "plan-detail": () => import("./tabMaps/plan-detail.js"),
      communications: () => import("./tabMaps/communications.js"),
      impacts: () => import("./tabMaps/impacts.js"),
    };

    try {
      const tabMapModule = await tabMaps[tabId]?.();
      return tabMapModule?.default || tabMapModule;
    } catch (error) {
      console.error(`Failed to load tabMap: ${tabId}`, error);
      return null;
    }
  },

  // Page lifecycle methods
  async onPageLoad(context = {}) {
    console.log("Phase 4: Page loading...");
    return await this.executePageWorkflow("onPageLoad", context);
  },

  async onPlanSelect(planId, context = {}) {
    console.log("Phase 4: Plan selected:", planId);
    return await this.executePageWorkflow("onPlanSelect", {
      ...context,
      planId,
    });
  },

  async onPageExit(context = {}) {
    console.log("Phase 4: Page exiting...");
    return await this.executePageWorkflow("onPageExit", context);
  },
};

export default planManagementWorkflowMap;
