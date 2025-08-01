/**
 * Workflow Testing Framework Tests
 *
 * Tests for the workflow testing framework, mock implementations, and integration helpers
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { WorkflowTestFramework } from "../testing/WorkflowTestFramework.js";
import {
  endToEndTestBuilder,
  databaseTestHelpers,
  apiTestHelpers,
  workflowChainTestHelpers,
  performanceTestHelpers,
} from "../testing/IntegrationTestHelpers.js";

describe("Workflow Testing Framework", () => {
  let testFramework;

  beforeEach(() => {
    testFramework = new WorkflowTestFramework();
  });

  describe("Test Registry", () => {
    it("should create isolated test registry", () => {
      const testRegistry = testFramework.createTestRegistry();

      expect(testRegistry).toBeDefined();
      expect(testRegistry.listWorkflows()).toHaveLength(0);
    });

    it("should register test workflows", () => {
      const testWorkflow = testFramework.createTestWorkflow("testWorkflow", {
        steps: [
          {
            name: "testStep",
            execute: async () => ({ test: true }),
          },
        ],
      });

      expect(testWorkflow.name).toBe("testWorkflow");
      expect(testWorkflow._isTestWorkflow).toBe(true);
      expect(
        testFramework.testRegistry.getWorkflow("testWorkflow")
      ).toBeDefined();
    });
  });

  describe("Mock Database", () => {
    it("should create mock database with initial data", () => {
      const mockDb = testFramework.createMockDatabase({
        users: [
          { id: 1, name: "John", email: "john@test.com" },
          { id: 2, name: "Jane", email: "jane@test.com" },
        ],
      });

      expect(mockDb.getTableData("users")).toHaveLength(2);
      expect(mockDb.getTableData("users")[0].name).toBe("John");
    });

    it("should handle INSERT operations", async () => {
      const mockDb = testFramework.createMockDatabase();

      const result = await mockDb.execDml({
        method: "INSERT",
        table: "users",
        data: { name: "Test User", email: "test@example.com" },
      });

      expect(result.success).toBe(true);
      expect(result.insertId).toBeDefined();
      expect(result.data.name).toBe("Test User");

      const users = mockDb.getTableData("users");
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe("Test User");
    });

    it("should handle UPDATE operations", async () => {
      const mockDb = testFramework.createMockDatabase({
        users: [{ id: 1, name: "John", email: "john@test.com" }],
      });

      const result = await mockDb.execDml({
        method: "UPDATE",
        table: "users",
        data: { name: "John Updated" },
        where: { id: 1 },
      });

      expect(result.success).toBe(true);
      expect(result.affectedRows).toBe(1);

      const users = mockDb.getTableData("users");
      expect(users[0].name).toBe("John Updated");
      expect(users[0].updated_at).toBeDefined();
    });

    it("should handle DELETE operations", async () => {
      const mockDb = testFramework.createMockDatabase({
        users: [
          { id: 1, name: "John" },
          { id: 2, name: "Jane" },
        ],
      });

      const result = await mockDb.execDml({
        method: "DELETE",
        table: "users",
        where: { id: 1 },
      });

      expect(result.success).toBe(true);
      expect(result.affectedRows).toBe(1);

      const users = mockDb.getTableData("users");
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe("Jane");
    });

    it("should handle complex WHERE clauses", async () => {
      const mockDb = testFramework.createMockDatabase({
        users: [
          { id: 1, name: "John", age: 25 },
          { id: 2, name: "Jane", age: 30 },
          { id: 3, name: "Bob", age: 35 },
        ],
      });

      const result = await mockDb.execDml({
        method: "SELECT",
        table: "users",
        where: { age: { $gt: 28 } },
      });

      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).toEqual(["Jane", "Bob"]);
    });
  });

  describe("Mock Services", () => {
    it("should create mock services with responses", async () => {
      const mockServices = testFramework.createMockServices({
        apiService: {
          responses: [
            {
              method: "getData",
              data: { success: true, data: "test data" },
            },
          ],
        },
      });

      const result = await mockServices.apiService.call("getData", { id: 1 });

      expect(result.success).toBe(true);
      expect(result.data).toBe("test data");

      const calls = mockServices.apiService.getCalls("getData");
      expect(calls).toHaveLength(1);
      expect(calls[0].params).toEqual({ id: 1 });
    });

    it("should simulate service errors", async () => {
      const mockServices = testFramework.createMockServices({
        unreliableService: {
          errors: [
            {
              method: "failingMethod",
              probability: 1,
              message: "Service unavailable",
            },
          ],
        },
      });

      await expect(
        mockServices.unreliableService.call("failingMethod", {})
      ).rejects.toThrow("Service unavailable");
    });

    it("should track service calls", async () => {
      const mockServices = testFramework.createMockServices({
        trackingService: {
          responses: [{ method: "*", data: { tracked: true } }],
        },
      });

      await mockServices.trackingService.call("method1", { param1: "value1" });
      await mockServices.trackingService.call("method2", { param2: "value2" });

      const allCalls = mockServices.trackingService.getCalls();
      expect(allCalls).toHaveLength(2);

      const method1Calls = mockServices.trackingService.getCalls("method1");
      expect(method1Calls).toHaveLength(1);
      expect(method1Calls[0].params.param1).toBe("value1");
    });
  });

  describe("Test Workflow Execution", () => {
    it("should execute test workflows with mocks", async () => {
      testFramework.createMockDatabase({ plans: [] });

      testFramework.createTestWorkflow("testPlanWorkflow", {
        steps: [
          {
            name: "createPlan",
            execute: async (context) => {
              const mockDb = context._mocks.database;
              const result = await mockDb.execDml({
                method: "INSERT",
                table: "plans",
                data: { name: context.planName, status: "new" },
              });
              return { planId: result.insertId, created: true };
            },
          },
        ],
      });

      const result = await testFramework.executeTestWorkflow(
        "testPlanWorkflow",
        {
          planName: "Test Plan",
        }
      );

      expect(result.success).toBe(true);
      expect(result.data.created).toBe(true);
      expect(result.data.planId).toBeDefined();
    });

    it("should record test execution history", async () => {
      testFramework.createTestWorkflow("historyTestWorkflow", {
        steps: [
          {
            name: "step1",
            execute: async () => ({ executed: true }),
          },
        ],
      });

      await testFramework.executeTestWorkflow("historyTestWorkflow", {
        test: true,
      });

      const stats = testFramework.getTestStats("historyTestWorkflow");
      expect(stats.totalExecutions).toBe(1);
      expect(stats.successfulExecutions).toBe(1);
      expect(stats.successRate).toBe(100);
    });
  });

  describe("Test Scenarios", () => {
    it("should create and execute test scenarios", async () => {
      const scenario = testFramework.createTestScenario("testScenario", {
        description: "Test scenario for workflow execution",
        setup: async (context) => {
          context.setupComplete = true;
        },
        steps: [
          {
            name: "step1",
            execute: async (context) => {
              expect(context.setupComplete).toBe(true);
              return { step1Complete: true };
            },
          },
        ],
        assertions: [
          (context, results) => {
            expect(results.steps).toHaveLength(1);
            expect(results.steps[0].success).toBe(true);
            return true;
          },
        ],
        teardown: async (context) => {
          context.teardownComplete = true;
        },
      });

      const result = await testFramework.executeTestScenario("testScenario");

      expect(result.success).toBe(true);
      expect(result.steps).toHaveLength(1);
      expect(result.assertions).toHaveLength(1);
      expect(result.assertions[0].success).toBe(true);
    });

    it("should handle scenario failures", async () => {
      testFramework.createTestScenario("failingScenario", {
        steps: [
          {
            name: "failingStep",
            execute: async () => {
              throw new Error("Step failed");
            },
          },
        ],
      });

      const result = await testFramework.executeTestScenario("failingScenario");

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.steps[0].success).toBe(false);
    });
  });

  describe("Performance Testing", () => {
    it("should run performance tests", async () => {
      testFramework.createTestWorkflow("perfTestWorkflow", {
        steps: [
          {
            name: "fastStep",
            execute: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              return { executed: true };
            },
          },
        ],
      });

      const perfResult = await testFramework.performanceTest(
        "perfTestWorkflow",
        {
          iterations: 5,
          concurrency: 2,
          warmupIterations: 1,
        }
      );

      expect(perfResult.workflow).toBe("perfTestWorkflow");
      expect(perfResult.iterations).toBe(5);
      expect(perfResult.executionTimes).toHaveLength(5);
      expect(perfResult.averageTime).toBeGreaterThan(0);
      expect(perfResult.successRate).toBe(100);
    });
  });
});

describe("Integration Test Helpers", () => {
  beforeEach(() => {
    testFramework = new WorkflowTestFramework();
    testFramework.createMockDatabase();
    testFramework.createMockServices({});
  });

  describe("End-to-End Test Builder", () => {
    it("should build end-to-end test scenarios", async () => {
      // Register test workflow
      testFramework.createTestWorkflow("e2eTestWorkflow", {
        steps: [
          {
            name: "process",
            execute: async (context) => ({ processed: context.input }),
          },
        ],
      });

      const scenario = endToEndTestBuilder("e2eTest")
        .setup("initialize", async (context) => {
          context.initialized = true;
        })
        .executeWorkflow("e2eTestWorkflow", { input: "test data" })
        .assert("should process data", (context, results) => {
          expect(results.steps[0].result.data.processed).toBe("test data");
          return true;
        })
        .teardown("cleanup", async (context) => {
          context.cleanedUp = true;
        })
        .build();

      const result = await testFramework.executeTestScenario("e2eTest");

      expect(result.success).toBe(true);
      expect(result.steps).toHaveLength(1);
      expect(result.assertions).toHaveLength(1);
    });
  });

  describe("Database Test Helpers", () => {
    it("should setup and assert database state", async () => {
      databaseTestHelpers.setupTestData({
        users: [
          { id: 1, name: "John", status: "active" },
          { id: 2, name: "Jane", status: "inactive" },
        ],
      });

      const assertRecordExists = databaseTestHelpers.assertRecordExists(
        "users",
        { name: "John" }
      );
      const foundRecord = assertRecordExists({});

      expect(foundRecord.name).toBe("John");
      expect(foundRecord.status).toBe("active");

      const assertRecordCount = databaseTestHelpers.assertRecordCount(
        "users",
        2
      );
      const count = assertRecordCount({});

      expect(count).toBe(2);
    });

    it("should throw on assertion failures", () => {
      databaseTestHelpers.setupTestData({
        users: [{ id: 1, name: "John" }],
      });

      const assertMissingRecord = databaseTestHelpers.assertRecordExists(
        "users",
        { name: "Missing" }
      );

      expect(() => assertMissingRecord({})).toThrow("Record not found");

      const assertWrongCount = databaseTestHelpers.assertRecordCount(
        "users",
        5
      );

      expect(() => assertWrongCount({})).toThrow("Expected 5 records");
    });
  });

  describe("API Test Helpers", () => {
    it("should setup and assert API calls", async () => {
      apiTestHelpers.setupApiResponses("testService", [
        {
          method: "getData",
          data: { success: true, data: "api response" },
        },
      ]);

      // Simulate API call
      const mockServices = testFramework.createMockServices({
        testService: {
          responses: [
            {
              method: "getData",
              data: { success: true, data: "api response" },
            },
          ],
        },
      });

      await mockServices.testService.call("getData", { id: 123 });

      const assertApiCalled = apiTestHelpers.assertApiCalled(
        "testService",
        "getData",
        1
      );
      const calls = assertApiCalled({});

      expect(calls).toHaveLength(1);

      const assertApiCalledWith = apiTestHelpers.assertApiCalledWith(
        "testService",
        "getData",
        { id: 123 }
      );
      const matchingCall = assertApiCalledWith({});

      expect(matchingCall.params.id).toBe(123);
    });
  });

  describe("Workflow Chain Test Helpers", () => {
    it("should create and execute workflow chains", async () => {
      // Register test workflows
      testFramework.createTestWorkflow("chainStep1", {
        steps: [
          {
            name: "step1",
            execute: async (context) => ({
              step1Result: context.input + "_step1",
            }),
          },
        ],
      });

      testFramework.createTestWorkflow("chainStep2", {
        steps: [
          {
            name: "step2",
            execute: async (context) => ({
              step2Result: context.step1Result + "_step2",
            }),
          },
        ],
      });

      workflowChainTestHelpers.createChainTest(
        "testChain",
        ["chainStep1", "chainStep2"],
        {
          passDataBetween: true,
        }
      );

      const result = await workflowChainTestHelpers.executeChain("testChain", {
        input: "test",
      });

      expect(result.success).toBe(true);
      expect(result.summary.successful).toBe(2);
      expect(result.results[1].data.step2Result).toBe("test_step1_step2");

      workflowChainTestHelpers.assertChainResults(result, {
        success: true,
        successfulSteps: 2,
      });
    });

    it("should handle chain failures", async () => {
      testFramework.createTestWorkflow("failingChainStep", {
        steps: [
          {
            name: "fail",
            execute: async () => {
              throw new Error("Chain step failed");
            },
          },
        ],
      });

      workflowChainTestHelpers.createChainTest(
        "failingChain",
        ["failingChainStep"],
        {
          stopOnError: true,
        }
      );

      const result = await workflowChainTestHelpers.executeChain(
        "failingChain"
      );

      expect(result.success).toBe(false);
      expect(result.summary.failed).toBe(1);
    });
  });

  describe("Performance Test Helpers", () => {
    it("should run load tests", async () => {
      testFramework.createTestWorkflow("loadTestWorkflow", {
        steps: [
          {
            name: "loadStep",
            execute: async () => {
              await new Promise((resolve) => setTimeout(resolve, 5));
              return { loaded: true };
            },
          },
        ],
      });

      const loadResult = await performanceTestHelpers.createLoadTest(
        "loadTestWorkflow",
        {
          duration: 100, // 100ms test
          maxConcurrency: 3,
          rampUpTime: 20,
        }
      );

      expect(loadResult.workflow).toBe("loadTestWorkflow");
      expect(loadResult.metrics.totalRequests).toBeGreaterThan(0);
      expect(loadResult.metrics.successfulRequests).toBeGreaterThan(0);
      expect(loadResult.metrics.averageResponseTime).toBeGreaterThan(0);
    }, 10000); // Longer timeout for load test
  });
});
