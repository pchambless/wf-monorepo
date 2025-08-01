/**
 * Lifecycle Testing Utilities
 *
 * Provides testing utilities for component lifecycle management in workflows
 */

import { componentLifecycleManager } from "../ComponentLifecycleManager.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("LifecycleTestUtils");

export class LifecycleTestUtils {
  constructor() {
    this.mockHooks = new Map();
    this.hookCallHistory = [];
    this.componentSnapshots = new Map();
  }

  /**
   * Create mock lifecycle hooks for testing
   * @param {string} componentName - Component identifier
   * @param {Object} options - Mock options
   */
  createMockHooks(componentName, options = {}) {
    const mockHooks = {
      onInit: this.createMockHook("onInit", componentName, options.onInit),
      onMount: this.createMockHook("onMount", componentName, options.onMount),
      onUpdate: this.createMockHook(
        "onUpdate",
        componentName,
        options.onUpdate
      ),
      onUnmount: this.createMockHook(
        "onUnmount",
        componentName,
        options.onUnmount
      ),
      onDestroy: this.createMockHook(
        "onDestroy",
        componentName,
        options.onDestroy
      ),
      onError: this.createMockHook("onError", componentName, options.onError),
      onStateChange: this.createMockHook(
        "onStateChange",
        componentName,
        options.onStateChange
      ),
    };

    this.mockHooks.set(componentName, mockHooks);
    return mockHooks;
  }

  /**
   * Create a single mock hook function
   * @private
   */
  createMockHook(hookName, componentName, customImplementation) {
    return async (...args) => {
      const callInfo = {
        hookName,
        componentName,
        args,
        timestamp: new Date(),
        callId: `${componentName}_${hookName}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 5)}`,
      };

      this.hookCallHistory.push(callInfo);

      log.debug("Mock hook called", {
        hookName,
        componentName,
        callId: callInfo.callId,
      });

      // Execute custom implementation if provided
      if (customImplementation && typeof customImplementation === "function") {
        try {
          const result = await customImplementation(...args);
          callInfo.result = result;
          return result;
        } catch (error) {
          callInfo.error = error.message;
          throw error;
        }
      }

      // Default mock behavior
      return { mockHook: hookName, called: true };
    };
  }

  /**
   * Register mock hooks with the lifecycle manager
   * @param {string} componentName - Component identifier
   * @param {Object} options - Mock options
   */
  registerMockHooks(componentName, options = {}) {
    const mockHooks = this.createMockHooks(componentName, options);
    componentLifecycleManager.registerLifecycleHooks(componentName, mockHooks);
    return mockHooks;
  }

  /**
   * Create a test component with full lifecycle
   * @param {string} componentName - Component identifier
   * @param {Object} options - Component options
   */
  async createTestComponent(componentName, options = {}) {
    const mockHooks = this.registerMockHooks(componentName, options.hooks);

    // Register error boundary if provided
    if (options.errorBoundary) {
      componentLifecycleManager.registerErrorBoundary(
        componentName,
        options.errorBoundary
      );
    }

    // Initialize component
    const component = await componentLifecycleManager.initializeComponent(
      componentName,
      options.context || {},
      options.options || {}
    );

    // Take initial snapshot
    this.takeComponentSnapshot(componentName, "created");

    return {
      component,
      mockHooks,
      utils: {
        mount: () => this.mountTestComponent(componentName),
        update: (updates) => this.updateTestComponent(componentName, updates),
        unmount: () => this.unmountTestComponent(componentName),
        destroy: () => this.destroyTestComponent(componentName),
        getState: () =>
          componentLifecycleManager.getComponentState(componentName),
        getHookCalls: () => this.getHookCallsForComponent(componentName),
        getSnapshots: () => this.getComponentSnapshots(componentName),
      },
    };
  }

  /**
   * Mount test component with snapshot
   * @param {string} componentName - Component identifier
   */
  async mountTestComponent(componentName) {
    const result = await componentLifecycleManager.mountComponent(
      componentName
    );
    this.takeComponentSnapshot(componentName, "mounted");
    return result;
  }

  /**
   * Update test component with snapshot
   * @param {string} componentName - Component identifier
   * @param {Object} updates - Updates to apply
   */
  async updateTestComponent(componentName, updates) {
    const result = await componentLifecycleManager.updateComponent(
      componentName,
      updates
    );
    this.takeComponentSnapshot(componentName, "updated");
    return result;
  }

  /**
   * Unmount test component with snapshot
   * @param {string} componentName - Component identifier
   */
  async unmountTestComponent(componentName) {
    const result = await componentLifecycleManager.unmountComponent(
      componentName
    );
    this.takeComponentSnapshot(componentName, "unmounted");
    return result;
  }

  /**
   * Destroy test component with snapshot
   * @param {string} componentName - Component identifier
   */
  async destroyTestComponent(componentName) {
    this.takeComponentSnapshot(componentName, "pre-destroy");
    const result = await componentLifecycleManager.destroyComponent(
      componentName
    );
    return result;
  }

  /**
   * Take a snapshot of component state
   * @param {string} componentName - Component identifier
   * @param {string} label - Snapshot label
   */
  takeComponentSnapshot(componentName, label) {
    const component =
      componentLifecycleManager.getComponentState(componentName);
    if (!component) return null;

    const snapshot = {
      label,
      timestamp: new Date(),
      state: component.state,
      data: { ...component.data },
      context: { ...component.context },
      errors: [...component.errors],
      createdAt: component.createdAt,
      lastUpdated: component.lastUpdated,
      mountedAt: component.mountedAt,
      unmountedAt: component.unmountedAt,
    };

    if (!this.componentSnapshots.has(componentName)) {
      this.componentSnapshots.set(componentName, []);
    }
    this.componentSnapshots.get(componentName).push(snapshot);

    return snapshot;
  }

  /**
   * Get component snapshots
   * @param {string} componentName - Component identifier
   */
  getComponentSnapshots(componentName) {
    return this.componentSnapshots.get(componentName) || [];
  }

  /**
   * Get hook calls for a specific component
   * @param {string} componentName - Component identifier
   */
  getHookCallsForComponent(componentName) {
    return this.hookCallHistory.filter(
      (call) => call.componentName === componentName
    );
  }

  /**
   * Get hook calls by hook name
   * @param {string} hookName - Hook name to filter by
   */
  getHookCallsByName(hookName) {
    return this.hookCallHistory.filter((call) => call.hookName === hookName);
  }

  /**
   * Assert hook was called
   * @param {string} componentName - Component identifier
   * @param {string} hookName - Hook name
   * @param {number} expectedCalls - Expected number of calls (default: 1)
   */
  assertHookCalled(componentName, hookName, expectedCalls = 1) {
    const calls = this.hookCallHistory.filter(
      (call) =>
        call.componentName === componentName && call.hookName === hookName
    );

    if (calls.length !== expectedCalls) {
      throw new Error(
        `Expected ${hookName} to be called ${expectedCalls} times for ${componentName}, but was called ${calls.length} times`
      );
    }

    return calls;
  }

  /**
   * Assert hook call order
   * @param {string} componentName - Component identifier
   * @param {Array} expectedOrder - Expected hook call order
   */
  assertHookCallOrder(componentName, expectedOrder) {
    const calls = this.getHookCallsForComponent(componentName);
    const actualOrder = calls.map((call) => call.hookName);

    if (actualOrder.length < expectedOrder.length) {
      throw new Error(
        `Expected ${expectedOrder.length} hook calls, but only ${actualOrder.length} were made`
      );
    }

    for (let i = 0; i < expectedOrder.length; i++) {
      if (actualOrder[i] !== expectedOrder[i]) {
        throw new Error(
          `Expected hook call ${i + 1} to be '${expectedOrder[i]}', but was '${
            actualOrder[i]
          }'`
        );
      }
    }

    return true;
  }

  /**
   * Assert component state transition
   * @param {string} componentName - Component identifier
   * @param {string} expectedState - Expected current state
   */
  assertComponentState(componentName, expectedState) {
    const component =
      componentLifecycleManager.getComponentState(componentName);

    if (!component) {
      throw new Error(`Component '${componentName}' not found`);
    }

    if (component.state !== expectedState) {
      throw new Error(
        `Expected component '${componentName}' to be in state '${expectedState}', but was in '${component.state}'`
      );
    }

    return component;
  }

  /**
   * Assert component data
   * @param {string} componentName - Component identifier
   * @param {Object} expectedData - Expected data properties
   */
  assertComponentData(componentName, expectedData) {
    const component =
      componentLifecycleManager.getComponentState(componentName);

    if (!component) {
      throw new Error(`Component '${componentName}' not found`);
    }

    Object.entries(expectedData).forEach(([key, expectedValue]) => {
      const actualValue = component.data[key];
      if (actualValue !== expectedValue) {
        throw new Error(
          `Expected component data '${key}' to be '${expectedValue}', but was '${actualValue}'`
        );
      }
    });

    return component;
  }

  /**
   * Create error boundary mock
   * @param {Object} options - Error boundary options
   */
  createErrorBoundaryMock(options = {}) {
    const calls = [];

    return async (error, phase, component) => {
      const callInfo = {
        error: error.message,
        phase,
        componentName: component?.name,
        componentState: component?.state,
        timestamp: new Date(),
      };

      calls.push(callInfo);

      log.debug("Error boundary mock called", callInfo);

      // Execute custom implementation if provided
      if (
        options.implementation &&
        typeof options.implementation === "function"
      ) {
        await options.implementation(error, phase, component);
      }

      // Store calls for assertions
      if (!this.errorBoundaryCalls) {
        this.errorBoundaryCalls = [];
      }
      this.errorBoundaryCalls.push(callInfo);

      return callInfo;
    };
  }

  /**
   * Assert error boundary was called
   * @param {number} expectedCalls - Expected number of calls
   */
  assertErrorBoundaryCalled(expectedCalls = 1) {
    const calls = this.errorBoundaryCalls || [];

    if (calls.length !== expectedCalls) {
      throw new Error(
        `Expected error boundary to be called ${expectedCalls} times, but was called ${calls.length} times`
      );
    }

    return calls;
  }

  /**
   * Reset all test state
   */
  reset() {
    this.mockHooks.clear();
    this.hookCallHistory = [];
    this.componentSnapshots.clear();
    this.errorBoundaryCalls = [];

    log.debug("Lifecycle test utils reset");
  }

  /**
   * Get test statistics
   */
  getTestStats() {
    const componentCount = this.mockHooks.size;
    const totalHookCalls = this.hookCallHistory.length;
    const hookCallsByType = {};

    this.hookCallHistory.forEach((call) => {
      hookCallsByType[call.hookName] =
        (hookCallsByType[call.hookName] || 0) + 1;
    });

    return {
      componentsCreated: componentCount,
      totalHookCalls,
      hookCallsByType,
      snapshotCount: Array.from(this.componentSnapshots.values()).reduce(
        (sum, snapshots) => sum + snapshots.length,
        0
      ),
      errorBoundaryCalls: (this.errorBoundaryCalls || []).length,
    };
  }
}

// Export singleton instance for convenience
export const lifecycleTestUtils = new LifecycleTestUtils();
export default lifecycleTestUtils;
