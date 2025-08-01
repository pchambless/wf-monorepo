/**
 * Component Lifecycle Tests
 *
 * Tests for component lifecycle management in workflows
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ComponentLifecycleManager } from "../ComponentLifecycleManager.js";
import { WorkflowInstance } from "../WorkflowInstance.js";
import { lifecycleTestUtils } from "../testing/LifecycleTestUtils.js";

describe("Component Lifecycle Management", () => {
  let lifecycleManager;

  beforeEach(() => {
    lifecycleManager = new ComponentLifecycleManager();
    lifecycleTestUtils.reset();
  });

  describe("Basic Lifecycle Operations", () => {
    it("should initialize component with proper state", async () => {
      const componentName = "testComponent";
      const context = { userId: 123, action: "test" };
      const options = { timeout: 5000 };

      const component = await lifecycleManager.initializeComponent(
        componentName,
        context,
        options
      );

      expect(component.name).toBe(componentName);
      expect(component.state).toBe("initialized");
      expect(component.context).toEqual(context);
      expect(component.options).toEqual(options);
      expect(component.createdAt).toBeInstanceOf(Date);
      expect(component.data).toEqual({});
      expect(component.errors).toEqual([]);
    });

    it("should mount component after initialization", async () => {
      const componentName = "mountTest";

      await lifecycleManager.initializeComponent(componentName);
      const component = await lifecycleManager.mountComponent(componentName);

      expect(component.state).toBe("mounted");
      expect(component.mountedAt).toBeInstanceOf(Date);
    });

    it("should update component data and context", async () => {
      const componentName = "updateTest";

      await lifecycleManager.initializeComponent(componentName);
      await lifecycleManager.mountComponent(componentName);

      const updates = {
        data: { processed: true, count: 5 },
        context: { newInfo: "updated" },
        options: { newOption: true },
      };

      const component = await lifecycleManager.updateComponent(
        componentName,
        updates
      );

      expect(component.data.processed).toBe(true);
      expect(component.data.count).toBe(5);
      expect(component.context.newInfo).toBe("updated");
      expect(component.options.newOption).toBe(true);
      expect(component.lastUpdated).toBeInstanceOf(Date);
    });

    it("should unmount and destroy component", async () => {
      const componentName = "destroyTest";

      await lifecycleManager.initializeComponent(componentName);
      await lifecycleManager.mountComponent(componentName);
      await lifecycleManager.unmountComponent(componentName);

      const component = lifecycleManager.getComponentState(componentName);
      expect(component.state).toBe("unmounted");
      expect(component.unmountedAt).toBeInstanceOf(Date);

      const destroyed = await lifecycleManager.destroyComponent(componentName);
      expect(destroyed).toBe(true);
      expect(lifecycleManager.getComponentState(componentName)).toBeNull();
    });
  });

  describe("State Transitions", () => {
    it("should validate state transitions", async () => {
      const componentName = "transitionTest";

      await lifecycleManager.initializeComponent(componentName);

      // Valid transition
      await expect(
        lifecycleManager.transitionState(componentName, "mounted")
      ).resolves.not.toThrow();

      // Invalid transition
      await expect(
        lifecycleManager.transitionState(componentName, "destroyed")
      ).rejects.toThrow("Invalid state transition");
    });

    it("should handle error state transitions", async () => {
      const componentName = "errorTransitionTest";

      await lifecycleManager.initializeComponent(componentName);
      await lifecycleManager.transitionState(componentName, "error");

      const component = lifecycleManager.getComponentState(componentName);
      expect(component.state).toBe("error");
    });
  });

  describe("Lifecycle Hooks", () => {
    it("should execute lifecycle hooks in correct order", async () => {
      const componentName = "hookTest";
      const hookCalls = [];

      const hooks = {
        onInit: async (context) => {
          hookCalls.push("onInit");
          return { initialized: true };
        },
        onMount: async (context) => {
          hookCalls.push("onMount");
          return { mounted: true };
        },
        onUpdate: async (updates, component) => {
          hookCalls.push("onUpdate");
          return { updated: true };
        },
        onUnmount: async (context) => {
          hookCalls.push("onUnmount");
          return { unmounted: true };
        },
        onDestroy: async (context) => {
          hookCalls.push("onDestroy");
          return { destroyed: true };
        },
        onStateChange: async (transition) => {
          hookCalls.push(`onStateChange:${transition.from}->${transition.to}`);
        },
      };

      lifecycleManager.registerLifecycleHooks(componentName, hooks);

      await lifecycleManager.initializeComponent(componentName);
      await lifecycleManager.mountComponent(componentName);
      await lifecycleManager.updateComponent(componentName, {
        data: { test: true },
      });
      await lifecycleManager.unmountComponent(componentName);
      await lifecycleManager.destroyComponent(componentName);

      expect(hookCalls).toContain("onInit");
      expect(hookCalls).toContain("onMount");
      expect(hookCalls).toContain("onUpdate");
      expect(hookCalls).toContain("onUnmount");
      expect(hookCalls).toContain("onDestroy");
      expect(
        hookCalls.filter((call) => call.startsWith("onStateChange")).length
      ).toBeGreaterThan(0);
    });

    it("should handle hook execution errors", async () => {
      const componentName = "hookErrorTest";

      const hooks = {
        onInit: async () => {
          throw new Error("Init hook failed");
        },
        onError: vi.fn(),
      };

      lifecycleManager.registerLifecycleHooks(componentName, hooks);

      await expect(
        lifecycleManager.initializeComponent(componentName)
      ).rejects.toThrow("Init hook failed");

      expect(hooks.onError).toHaveBeenCalled();
    });
  });

  describe("Error Boundaries", () => {
    it("should execute error boundary on component errors", async () => {
      const componentName = "errorBoundaryTest";
      const errorBoundary = vi.fn();

      lifecycleManager.registerErrorBoundary(componentName, errorBoundary);

      const hooks = {
        onInit: async () => {
          throw new Error("Component initialization failed");
        },
      };

      lifecycleManager.registerLifecycleHooks(componentName, hooks);

      await expect(
        lifecycleManager.initializeComponent(componentName)
      ).rejects.toThrow();

      expect(errorBoundary).toHaveBeenCalledWith(
        expect.any(Error),
        "initialization",
        expect.any(Object)
      );
    });
  });

  describe("Component Queries", () => {
    beforeEach(async () => {
      await lifecycleManager.initializeComponent("comp1");
      await lifecycleManager.initializeComponent("comp2");
      await lifecycleManager.mountComponent("comp1");
    });

    it("should list active components", () => {
      const components = lifecycleManager.listActiveComponents();
      expect(components).toHaveLength(2);
      expect(components.map((c) => c.name)).toContain("comp1");
      expect(components.map((c) => c.name)).toContain("comp2");
    });

    it("should filter components by state", () => {
      const mountedComponents =
        lifecycleManager.getComponentsByState("mounted");
      const initializedComponents =
        lifecycleManager.getComponentsByState("initialized");

      expect(mountedComponents).toHaveLength(1);
      expect(mountedComponents[0].name).toBe("comp1");
      expect(initializedComponents).toHaveLength(1);
      expect(initializedComponents[0].name).toBe("comp2");
    });

    it("should provide lifecycle statistics", () => {
      const stats = lifecycleManager.getLifecycleStats();

      expect(stats.totalComponents).toBe(2);
      expect(stats.stateDistribution.mounted).toBe(1);
      expect(stats.stateDistribution.initialized).toBe(1);
      expect(stats.averageLifetime).toBeGreaterThan(0);
    });
  });

  describe("Cleanup Operations", () => {
    it("should cleanup all components", async () => {
      await lifecycleManager.initializeComponent("cleanup1");
      await lifecycleManager.initializeComponent("cleanup2");
      await lifecycleManager.mountComponent("cleanup1");

      expect(lifecycleManager.listActiveComponents()).toHaveLength(2);

      await lifecycleManager.cleanup();

      expect(lifecycleManager.listActiveComponents()).toHaveLength(0);
    });
  });
});

describe("Workflow Integration with Lifecycle", () => {
  beforeEach(() => {
    lifecycleTestUtils.reset();
  });

  describe("Step Lifecycle Integration", () => {
    it("should manage component lifecycle for steps with lifecycle config", async () => {
      const hookCalls = [];

      const workflow = {
        name: "lifecycleWorkflow",
        steps: [
          {
            name: "lifecycleStep",
            lifecycle: {
              hooks: {
                onInit: async (context) => {
                  hookCalls.push("step-init");
                  return { stepInitialized: true };
                },
                onMount: async (context) => {
                  hookCalls.push("step-mount");
                  return { stepMounted: true };
                },
                onUnmount: async (context) => {
                  hookCalls.push("step-unmount");
                  return { stepUnmounted: true };
                },
              },
              autoMount: true,
              unmountAfterExecution: true,
            },
            execute: async (context, state) => {
              hookCalls.push("step-execute");
              return { stepExecuted: true };
            },
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();

      expect(result.success).toBe(true);
      expect(hookCalls).toEqual([
        "step-init",
        "step-mount",
        "step-execute",
        "step-unmount",
      ]);
    });

    it("should handle step component errors with error boundaries", async () => {
      const errorBoundary = vi.fn();

      const workflow = {
        name: "errorWorkflow",
        steps: [
          {
            name: "errorStep",
            lifecycle: {
              errorBoundary,
              hooks: {
                onInit: async () => {
                  throw new Error("Step initialization failed");
                },
              },
            },
            execute: async () => ({ shouldNotExecute: true }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      const result = await instance.execute();

      expect(result.success).toBe(false);
      expect(errorBoundary).toHaveBeenCalled();
    });

    it("should provide component state information in workflow results", async () => {
      const workflow = {
        name: "componentStateWorkflow",
        steps: [
          {
            name: "componentStep",
            lifecycle: {
              hooks: {
                onInit: async () => ({ initialized: true }),
                onMount: async () => ({ mounted: true }),
              },
            },
            execute: async () => ({ executed: true }),
          },
        ],
      };

      const instance = new WorkflowInstance(workflow, {});
      await instance.execute();

      const componentStates = instance.getManagedComponentStates();
      expect(Object.keys(componentStates)).toHaveLength(1);

      const componentState = Object.values(componentStates)[0];
      expect(componentState.state).toBe("unmounted"); // Should be unmounted after execution
      expect(componentState.createdAt).toBeInstanceOf(Date);
    });
  });
});

describe("Lifecycle Test Utils", () => {
  beforeEach(() => {
    lifecycleTestUtils.reset();
  });

  describe("Mock Hook Creation", () => {
    it("should create and track mock hooks", async () => {
      const componentName = "mockTest";
      const mockHooks = lifecycleTestUtils.createMockHooks(componentName);

      expect(mockHooks.onInit).toBeInstanceOf(Function);
      expect(mockHooks.onMount).toBeInstanceOf(Function);

      // Call a mock hook
      await mockHooks.onInit({ test: true });

      const hookCalls =
        lifecycleTestUtils.getHookCallsForComponent(componentName);
      expect(hookCalls).toHaveLength(1);
      expect(hookCalls[0].hookName).toBe("onInit");
      expect(hookCalls[0].args[0]).toEqual({ test: true });
    });

    it("should support custom hook implementations", async () => {
      const componentName = "customMockTest";
      const customInit = vi.fn().mockResolvedValue({ custom: true });

      const mockHooks = lifecycleTestUtils.createMockHooks(componentName, {
        onInit: customInit,
      });

      const result = await mockHooks.onInit({ context: "test" });

      expect(customInit).toHaveBeenCalledWith({ context: "test" });
      expect(result).toEqual({ custom: true });
    });
  });

  describe("Test Component Creation", () => {
    it("should create test component with utilities", async () => {
      const componentName = "testComponentUtils";

      const testComponent = await lifecycleTestUtils.createTestComponent(
        componentName,
        {
          context: { testMode: true },
          hooks: {
            onInit: async () => ({ testInit: true }),
          },
        }
      );

      expect(testComponent.component.name).toBe(componentName);
      expect(testComponent.component.state).toBe("initialized");
      expect(testComponent.utils.mount).toBeInstanceOf(Function);
      expect(testComponent.utils.getState).toBeInstanceOf(Function);

      // Test utility functions
      await testComponent.utils.mount();
      const state = testComponent.utils.getState();
      expect(state.state).toBe("mounted");

      const hookCalls = testComponent.utils.getHookCalls();
      expect(hookCalls.some((call) => call.hookName === "onInit")).toBe(true);
    });
  });

  describe("Component Snapshots", () => {
    it("should take and retrieve component snapshots", async () => {
      const componentName = "snapshotTest";

      const testComponent = await lifecycleTestUtils.createTestComponent(
        componentName
      );
      await testComponent.utils.mount();
      await testComponent.utils.update({ data: { updated: true } });

      const snapshots = testComponent.utils.getSnapshots();
      expect(snapshots).toHaveLength(3); // created, mounted, updated
      expect(snapshots[0].label).toBe("created");
      expect(snapshots[1].label).toBe("mounted");
      expect(snapshots[2].label).toBe("updated");
      expect(snapshots[2].data.updated).toBe(true);
    });
  });

  describe("Test Assertions", () => {
    it("should assert hook calls correctly", async () => {
      const componentName = "assertionTest";

      const testComponent = await lifecycleTestUtils.createTestComponent(
        componentName
      );
      await testComponent.utils.mount();

      // Should pass
      lifecycleTestUtils.assertHookCalled(componentName, "onInit", 1);
      lifecycleTestUtils.assertHookCalled(componentName, "onMount", 1);

      // Should fail
      expect(() => {
        lifecycleTestUtils.assertHookCalled(componentName, "onDestroy", 1);
      }).toThrow("Expected onDestroy to be called 1 times");
    });

    it("should assert hook call order", async () => {
      const componentName = "orderTest";

      const testComponent = await lifecycleTestUtils.createTestComponent(
        componentName
      );
      await testComponent.utils.mount();
      await testComponent.utils.unmount();

      // Should pass
      lifecycleTestUtils.assertHookCallOrder(componentName, [
        "onInit",
        "onMount",
        "onUnmount",
      ]);

      // Should fail
      expect(() => {
        lifecycleTestUtils.assertHookCallOrder(componentName, [
          "onMount",
          "onInit",
        ]);
      }).toThrow("Expected hook call 1 to be 'onMount', but was 'onInit'");
    });

    it("should assert component state and data", async () => {
      const componentName = "stateAssertionTest";

      const testComponent = await lifecycleTestUtils.createTestComponent(
        componentName
      );
      await testComponent.utils.mount();
      await testComponent.utils.update({ data: { test: "value" } });

      // Should pass
      lifecycleTestUtils.assertComponentState(componentName, "mounted");
      lifecycleTestUtils.assertComponentData(componentName, { test: "value" });

      // Should fail
      expect(() => {
        lifecycleTestUtils.assertComponentState(componentName, "destroyed");
      }).toThrow(
        "Expected component 'stateAssertionTest' to be in state 'destroyed', but was in 'mounted'"
      );
    });
  });

  describe("Error Boundary Testing", () => {
    it("should test error boundaries", async () => {
      const errorBoundary = lifecycleTestUtils.createErrorBoundaryMock({
        implementation: async (error, phase, component) => {
          // Custom error handling
        },
      });

      const componentName = "errorBoundaryTest";

      const testComponent = await lifecycleTestUtils.createTestComponent(
        componentName,
        {
          errorBoundary,
          hooks: {
            onMount: async () => {
              throw new Error("Mount failed");
            },
          },
        }
      );

      await expect(testComponent.utils.mount()).rejects.toThrow("Mount failed");

      lifecycleTestUtils.assertErrorBoundaryCalled(1);
    });
  });

  describe("Test Statistics", () => {
    it("should provide test statistics", async () => {
      const comp1 = await lifecycleTestUtils.createTestComponent("comp1");
      const comp2 = await lifecycleTestUtils.createTestComponent("comp2");

      await comp1.utils.mount();
      await comp2.utils.mount();
      await comp1.utils.update({ data: { test: true } });

      const stats = lifecycleTestUtils.getTestStats();

      expect(stats.componentsCreated).toBe(2);
      expect(stats.totalHookCalls).toBeGreaterThan(0);
      expect(stats.hookCallsByType.onInit).toBe(2);
      expect(stats.hookCallsByType.onMount).toBe(2);
      expect(stats.snapshotCount).toBeGreaterThan(0);
    });
  });
});
