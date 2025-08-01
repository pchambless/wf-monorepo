/**
 * Component Lifecycle Manager
 *
 * Manages component lifecycle hooks within workflow execution
 * Provides initialization, cleanup, state transitions, and error boundaries
 */

import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("ComponentLifecycleManager");

export class ComponentLifecycleManager {
  constructor() {
    this.activeComponents = new Map();
    this.lifecycleHooks = new Map();
    this.stateTransitions = new Map();
    this.errorBoundaries = new Map();
  }

  /**
   * Register lifecycle hooks for a component
   * @param {string} componentName - Component identifier
   * @param {Object} hooks - Lifecycle hooks
   */
  registerLifecycleHooks(componentName, hooks) {
    const validHooks = {
      onInit: hooks.onInit || null,
      onMount: hooks.onMount || null,
      onUpdate: hooks.onUpdate || null,
      onUnmount: hooks.onUnmount || null,
      onDestroy: hooks.onDestroy || null,
      onError: hooks.onError || null,
      onStateChange: hooks.onStateChange || null,
    };

    // Validate hook functions
    Object.entries(validHooks).forEach(([hookName, hookFn]) => {
      if (hookFn && typeof hookFn !== "function") {
        throw new Error(`${hookName} must be a function`);
      }
    });

    this.lifecycleHooks.set(componentName, validHooks);

    log.debug("Lifecycle hooks registered", {
      componentName,
      hooks: Object.keys(validHooks).filter((key) => validHooks[key]),
    });
  }

  /**
   * Initialize a component with lifecycle management
   * @param {string} componentName - Component identifier
   * @param {Object} context - Initialization context
   * @param {Object} options - Initialization options
   */
  async initializeComponent(componentName, context = {}, options = {}) {
    if (this.activeComponents.has(componentName)) {
      log.warn("Component already initialized", { componentName });
      return this.activeComponents.get(componentName);
    }

    const componentState = {
      name: componentName,
      state: "initializing",
      context,
      options,
      data: {},
      errors: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      mountedAt: null,
      unmountedAt: null,
    };

    this.activeComponents.set(componentName, componentState);

    try {
      // Execute initialization hook
      await this.executeHook(componentName, "onInit", context, componentState);

      // Transition to initialized state
      await this.transitionState(componentName, "initialized");

      log.info("Component initialized", {
        componentName,
        state: componentState.state,
      });

      return componentState;
    } catch (error) {
      await this.handleComponentError(componentName, error, "initialization");
      throw error;
    }
  }

  /**
   * Mount a component (make it active in the workflow)
   * @param {string} componentName - Component identifier
   * @param {Object} mountContext - Mount context
   */
  async mountComponent(componentName, mountContext = {}) {
    const component = this.activeComponents.get(componentName);
    if (!component) {
      throw new Error(`Component '${componentName}' not initialized`);
    }

    if (component.state === "mounted") {
      log.warn("Component already mounted", { componentName });
      return component;
    }

    try {
      // Execute mount hook
      await this.executeHook(componentName, "onMount", mountContext, component);

      // Transition to mounted state
      await this.transitionState(componentName, "mounted");
      component.mountedAt = new Date();

      log.info("Component mounted", {
        componentName,
        state: component.state,
      });

      return component;
    } catch (error) {
      await this.handleComponentError(componentName, error, "mounting");
      throw error;
    }
  }

  /**
   * Update a component's state or context
   * @param {string} componentName - Component identifier
   * @param {Object} updates - Updates to apply
   */
  async updateComponent(componentName, updates = {}) {
    const component = this.activeComponents.get(componentName);
    if (!component) {
      throw new Error(`Component '${componentName}' not found`);
    }

    const previousState = { ...component };

    try {
      // Apply updates
      if (updates.context) {
        component.context = { ...component.context, ...updates.context };
      }
      if (updates.data) {
        component.data = { ...component.data, ...updates.data };
      }
      if (updates.options) {
        component.options = { ...component.options, ...updates.options };
      }

      component.lastUpdated = new Date();

      // Execute update hook
      await this.executeHook(
        componentName,
        "onUpdate",
        updates,
        component,
        previousState
      );

      log.debug("Component updated", {
        componentName,
        updates: Object.keys(updates),
      });

      return component;
    } catch (error) {
      await this.handleComponentError(componentName, error, "updating");
      throw error;
    }
  }

  /**
   * Unmount a component (deactivate but keep in memory)
   * @param {string} componentName - Component identifier
   * @param {Object} unmountContext - Unmount context
   */
  async unmountComponent(componentName, unmountContext = {}) {
    const component = this.activeComponents.get(componentName);
    if (!component) {
      log.warn("Component not found for unmounting", { componentName });
      return;
    }

    if (component.state === "unmounted") {
      log.warn("Component already unmounted", { componentName });
      return component;
    }

    try {
      // Execute unmount hook
      await this.executeHook(
        componentName,
        "onUnmount",
        unmountContext,
        component
      );

      // Transition to unmounted state
      await this.transitionState(componentName, "unmounted");
      component.unmountedAt = new Date();

      log.info("Component unmounted", {
        componentName,
        state: component.state,
      });

      return component;
    } catch (error) {
      await this.handleComponentError(componentName, error, "unmounting");
      throw error;
    }
  }

  /**
   * Destroy a component (cleanup and remove from memory)
   * @param {string} componentName - Component identifier
   * @param {Object} destroyContext - Destroy context
   */
  async destroyComponent(componentName, destroyContext = {}) {
    const component = this.activeComponents.get(componentName);
    if (!component) {
      log.warn("Component not found for destruction", { componentName });
      return;
    }

    try {
      // Unmount first if still mounted
      if (component.state === "mounted") {
        await this.unmountComponent(componentName);
      }

      // Execute destroy hook
      await this.executeHook(
        componentName,
        "onDestroy",
        destroyContext,
        component
      );

      // Remove from active components
      this.activeComponents.delete(componentName);

      log.info("Component destroyed", {
        componentName,
        lifetime: new Date() - component.createdAt,
      });

      return true;
    } catch (error) {
      await this.handleComponentError(componentName, error, "destruction");
      throw error;
    }
  }

  /**
   * Transition component state with validation
   * @param {string} componentName - Component identifier
   * @param {string} newState - Target state
   */
  async transitionState(componentName, newState) {
    const component = this.activeComponents.get(componentName);
    if (!component) {
      throw new Error(`Component '${componentName}' not found`);
    }

    const currentState = component.state;

    // Validate state transition
    if (!this.isValidStateTransition(currentState, newState)) {
      throw new Error(
        `Invalid state transition from '${currentState}' to '${newState}'`
      );
    }

    const previousState = currentState;
    component.state = newState;
    component.lastUpdated = new Date();

    // Execute state change hook
    await this.executeHook(
      componentName,
      "onStateChange",
      {
        from: previousState,
        to: newState,
        timestamp: component.lastUpdated,
      },
      component
    );

    log.debug("Component state transitioned", {
      componentName,
      from: previousState,
      to: newState,
    });
  }

  /**
   * Validate state transition
   * @private
   */
  isValidStateTransition(currentState, newState) {
    const validTransitions = {
      initializing: ["initialized", "error"],
      initialized: ["mounting", "mounted", "error"],
      mounting: ["mounted", "error"],
      mounted: ["updating", "unmounting", "error"],
      updating: ["mounted", "error"],
      unmounting: ["unmounted", "error"],
      unmounted: ["mounting", "destroyed", "error"],
      error: ["initialized", "destroyed"],
      destroyed: [], // Terminal state
    };

    return validTransitions[currentState]?.includes(newState) || false;
  }

  /**
   * Execute a lifecycle hook
   * @private
   */
  async executeHook(componentName, hookName, ...args) {
    const hooks = this.lifecycleHooks.get(componentName);
    if (!hooks || !hooks[hookName]) {
      return; // No hook registered
    }

    try {
      const result = await hooks[hookName](...args);

      log.debug("Lifecycle hook executed", {
        componentName,
        hookName,
        hasResult: !!result,
      });

      return result;
    } catch (error) {
      log.error("Lifecycle hook failed", {
        componentName,
        hookName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Handle component errors with error boundaries
   * @private
   */
  async handleComponentError(componentName, error, phase) {
    const component = this.activeComponents.get(componentName);
    if (component) {
      component.errors.push({
        error: error.message,
        phase,
        timestamp: new Date().toISOString(),
        stack: error.stack,
      });

      // Transition to error state
      component.state = "error";
      component.lastUpdated = new Date();
    }

    // Execute error hook
    try {
      await this.executeHook(componentName, "onError", error, phase, component);
    } catch (hookError) {
      log.error("Error hook failed", {
        componentName,
        originalError: error.message,
        hookError: hookError.message,
      });
    }

    // Check for error boundary
    const errorBoundary = this.errorBoundaries.get(componentName);
    if (errorBoundary) {
      try {
        await errorBoundary(error, phase, component);
      } catch (boundaryError) {
        log.error("Error boundary failed", {
          componentName,
          originalError: error.message,
          boundaryError: boundaryError.message,
        });
      }
    }

    log.error("Component error handled", {
      componentName,
      phase,
      error: error.message,
      state: component?.state,
    });
  }

  /**
   * Register an error boundary for a component
   * @param {string} componentName - Component identifier
   * @param {Function} errorBoundary - Error boundary function
   */
  registerErrorBoundary(componentName, errorBoundary) {
    if (typeof errorBoundary !== "function") {
      throw new Error("Error boundary must be a function");
    }

    this.errorBoundaries.set(componentName, errorBoundary);

    log.debug("Error boundary registered", { componentName });
  }

  /**
   * Get component state
   * @param {string} componentName - Component identifier
   */
  getComponentState(componentName) {
    return this.activeComponents.get(componentName) || null;
  }

  /**
   * List all active components
   */
  listActiveComponents() {
    return Array.from(this.activeComponents.values());
  }

  /**
   * Get components by state
   * @param {string} state - Component state to filter by
   */
  getComponentsByState(state) {
    return Array.from(this.activeComponents.values()).filter(
      (component) => component.state === state
    );
  }

  /**
   * Cleanup all components (for shutdown)
   */
  async cleanup() {
    const activeComponents = Array.from(this.activeComponents.keys());

    log.info("Cleaning up all components", {
      count: activeComponents.length,
    });

    for (const componentName of activeComponents) {
      try {
        await this.destroyComponent(componentName);
      } catch (error) {
        log.error("Failed to cleanup component", {
          componentName,
          error: error.message,
        });
      }
    }

    this.lifecycleHooks.clear();
    this.stateTransitions.clear();
    this.errorBoundaries.clear();

    log.info("Component lifecycle manager cleanup completed");
  }

  /**
   * Get lifecycle statistics
   */
  getLifecycleStats() {
    const components = Array.from(this.activeComponents.values());
    const stateCount = {};

    components.forEach((component) => {
      stateCount[component.state] = (stateCount[component.state] || 0) + 1;
    });

    return {
      totalComponents: components.length,
      stateDistribution: stateCount,
      registeredHooks: this.lifecycleHooks.size,
      errorBoundaries: this.errorBoundaries.size,
      averageLifetime:
        components.length > 0
          ? components.reduce((sum, c) => sum + (new Date() - c.createdAt), 0) /
            components.length
          : 0,
    };
  }
}

// Export singleton instance
export const componentLifecycleManager = new ComponentLifecycleManager();
export default componentLifecycleManager;
