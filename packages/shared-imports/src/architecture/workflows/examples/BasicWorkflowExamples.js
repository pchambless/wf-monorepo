/**
 * Basic Workflow Examples
 *
 * Collection of common workflow patterns and examples for developers
 */

import { workflowRegistry } from "../WorkflowRegistry.js";
import { getComponentWorkflowConfig } from "../config/workflowConfig.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("BasicWorkflowExamples");

/**
 * Example 1: Simple CRUD Operations
 */
export const crudWorkflowExamples = {
  // Create operation workflow
  createUser: {
    name: "createUser",
    description: "Create a new user with validation and audit trail",
    steps: [
      {
        name: "validateInput",
        execute: async (context) => {
          const { email, name, role } = context;

          if (!email || !email.includes("@")) {
            throw new Error("Valid email is required");
          }

          if (!name || name.length < 2) {
            throw new Error("Name must be at least 2 characters");
          }

          const validRoles = ["user", "admin", "moderator"];
          if (role && !validRoles.includes(role)) {
            throw new Error(`Role must be one of: ${validRoles.join(", ")}`);
          }

          return {
            validated: true,
            normalizedEmail: email.toLowerCase(),
            normalizedName: name.trim(),
          };
        },
      },
      {
        name: "checkDuplicates",
        execute: async (context, state) => {
          // In real implementation, this would check the database
          const existingUsers =
            context._mocks?.database?.getTableData("users") || [];
          const duplicate = existingUsers.find(
            (user) => user.email === state.data.normalizedEmail
          );

          if (duplicate) {
            throw new Error("User with this email already exists");
          }

          return { duplicateCheck: "passed" };
        },
      },
      {
        name: "createUserRecord",
        execute: async (context, state) => {
          const userData = {
            email: state.data.normalizedEmail,
            name: state.data.normalizedName,
            role: context.role || "user",
            createdAt: new Date().toISOString(),
            createdBy: context.userID || "system",
            active: true,
          };

          // Mock database operation
          if (context._mocks?.database) {
            const result = await context._mocks.database.execDml({
              method: "INSERT",
              table: "users",
              data: userData,
            });
            return { userId: result.insertId, created: true };
          }

          // Real database operation would go here
          const userId = Date.now(); // Mock ID
          return { userId, created: true, userData };
        },
      },
      {
        name: "sendWelcomeEmail",
        condition: "created === true",
        execute: async (context, state) => {
          // Mock email service
          if (context._mocks?.services?.emailService) {
            await context._mocks.services.emailService.call("sendWelcome", {
              to: state.data.normalizedEmail,
              name: state.data.normalizedName,
            });
          }

          return { welcomeEmailSent: true };
        },
      },
    ],
    contextRefresh: ["userList"], // Refresh user list after creation
  },

  // Read operation workflow
  getUserDetails: {
    name: "getUserDetails",
    description: "Retrieve user details with permission checking",
    steps: [
      {
        name: "validatePermissions",
        execute: async (context) => {
          const { requestingUserId, targetUserId, requestingUserRole } =
            context;

          // Users can view their own details, admins can view anyone
          if (
            requestingUserId !== targetUserId &&
            requestingUserRole !== "admin"
          ) {
            throw new Error("Insufficient permissions to view user details");
          }

          return { permissionGranted: true };
        },
      },
      {
        name: "fetchUserData",
        execute: async (context) => {
          // Mock database operation
          if (context._mocks?.database) {
            const users = context._mocks.database.getTableData("users");
            const user = users.find((u) => u.id === context.targetUserId);

            if (!user) {
              throw new Error("User not found");
            }

            return { user };
          }

          // Real database operation would go here
          return {
            user: {
              id: context.targetUserId,
              email: "user@example.com",
              name: "Example User",
              role: "user",
            },
          };
        },
      },
      {
        name: "sanitizeUserData",
        execute: async (context, state) => {
          const { user } = state.data;

          // Remove sensitive fields based on permissions
          const sanitizedUser = { ...user };

          if (context.requestingUserRole !== "admin") {
            delete sanitizedUser.createdBy;
            delete sanitizedUser.lastLoginIP;
          }

          return { sanitizedUser };
        },
      },
    ],
  },

  // Update operation workflow
  updateUser: {
    name: "updateUser",
    description: "Update user information with validation and audit trail",
    steps: [
      {
        name: "validatePermissions",
        execute: async (context) => {
          const { requestingUserId, targetUserId, requestingUserRole } =
            context;

          if (
            requestingUserId !== targetUserId &&
            requestingUserRole !== "admin"
          ) {
            throw new Error("Insufficient permissions to update user");
          }

          return { permissionGranted: true };
        },
      },
      {
        name: "validateUpdates",
        execute: async (context) => {
          const { updates } = context;
          const validatedUpdates = {};

          if (updates.email) {
            if (!updates.email.includes("@")) {
              throw new Error("Invalid email format");
            }
            validatedUpdates.email = updates.email.toLowerCase();
          }

          if (updates.name) {
            if (updates.name.length < 2) {
              throw new Error("Name must be at least 2 characters");
            }
            validatedUpdates.name = updates.name.trim();
          }

          if (updates.role) {
            const validRoles = ["user", "admin", "moderator"];
            if (!validRoles.includes(updates.role)) {
              throw new Error(`Role must be one of: ${validRoles.join(", ")}`);
            }
            validatedUpdates.role = updates.role;
          }

          return { validatedUpdates };
        },
      },
      {
        name: "updateUserRecord",
        execute: async (context, state) => {
          const updateData = {
            ...state.data.validatedUpdates,
            updatedAt: new Date().toISOString(),
            updatedBy: context.requestingUserId,
          };

          // Mock database operation
          if (context._mocks?.database) {
            const result = await context._mocks.database.execDml({
              method: "UPDATE",
              table: "users",
              data: updateData,
              where: { id: context.targetUserId },
            });
            return {
              updated: result.success,
              affectedRows: result.affectedRows,
            };
          }

          return { updated: true, affectedRows: 1 };
        },
      },
    ],
    contextRefresh: ["userList", "userDetails"],
  },

  // Delete operation workflow
  deleteUser: {
    name: "deleteUser",
    description: "Soft delete user with cleanup and audit trail",
    steps: [
      {
        name: "validatePermissions",
        execute: async (context) => {
          if (context.requestingUserRole !== "admin") {
            throw new Error("Only administrators can delete users");
          }

          if (context.requestingUserId === context.targetUserId) {
            throw new Error("Cannot delete your own account");
          }

          return { permissionGranted: true };
        },
      },
      {
        name: "checkDependencies",
        execute: async (context) => {
          // Check if user has dependent records
          const dependencies = [];

          // Mock dependency checks
          if (context._mocks?.database) {
            const orders = context._mocks.database.getTableData("orders") || [];
            const userOrders = orders.filter(
              (o) => o.userId === context.targetUserId
            );

            if (userOrders.length > 0) {
              dependencies.push(`${userOrders.length} orders`);
            }
          }

          return { dependencies, canDelete: dependencies.length === 0 };
        },
      },
      {
        name: "performSoftDelete",
        condition: "canDelete === true",
        execute: async (context, state) => {
          const deleteData = {
            active: false,
            deletedAt: new Date().toISOString(),
            deletedBy: context.requestingUserId,
          };

          // Mock database operation
          if (context._mocks?.database) {
            const result = await context._mocks.database.execDml({
              method: "UPDATE",
              table: "users",
              data: deleteData,
              where: { id: context.targetUserId },
            });
            return { deleted: result.success };
          }

          return { deleted: true };
        },
      },
      {
        name: "cleanupUserSessions",
        condition: "deleted === true",
        execute: async (context) => {
          // Mock session cleanup
          if (context._mocks?.services?.sessionService) {
            await context._mocks.services.sessionService.call(
              "invalidateUserSessions",
              {
                userId: context.targetUserId,
              }
            );
          }

          return { sessionsCleared: true };
        },
      },
    ],
    contextRefresh: ["userList"],
  },
};

/**
 * Example 2: Business Process Workflows
 */
export const businessProcessExamples = {
  // Order processing workflow
  processOrder: {
    name: "processOrder",
    description: "Complete order processing from validation to fulfillment",
    dependencies: [
      { workflow: "validateInventory", context: { productIds: "order.items" } },
    ],
    steps: [
      {
        name: "validateOrder",
        execute: async (context) => {
          const { order } = context;

          if (!order || !order.items || order.items.length === 0) {
            throw new Error("Order must contain at least one item");
          }

          if (!order.customerId) {
            throw new Error("Customer ID is required");
          }

          const total = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return {
            validated: true,
            calculatedTotal: total,
            itemCount: order.items.length,
          };
        },
      },
      {
        name: "processPayment",
        condition: "calculatedTotal > 0",
        timeout: 30000, // Payment processing can take longer
        execute: async (context, state) => {
          const { paymentMethod } = context;
          const { calculatedTotal } = state.data;

          // Mock payment processing
          if (context._mocks?.services?.paymentService) {
            const result = await context._mocks.services.paymentService.call(
              "processPayment",
              {
                amount: calculatedTotal,
                paymentMethod,
                orderId: context.order.id,
              }
            );

            if (!result.success) {
              throw new Error("Payment processing failed");
            }

            return {
              paymentProcessed: true,
              transactionId: result.transactionId,
              paidAmount: calculatedTotal,
            };
          }

          return {
            paymentProcessed: true,
            transactionId: `txn_${Date.now()}`,
            paidAmount: calculatedTotal,
          };
        },
      },
      {
        name: "updateInventory",
        parallel: true,
        execute: async (context) => {
          const { order } = context;

          // Mock inventory update
          if (context._mocks?.services?.inventoryService) {
            await context._mocks.services.inventoryService.call(
              "reserveItems",
              {
                items: order.items,
                orderId: order.id,
              }
            );
          }

          return { inventoryUpdated: true };
        },
      },
      {
        name: "sendConfirmation",
        parallel: true,
        execute: async (context, state) => {
          const { order } = context;
          const { transactionId } = state.data;

          // Mock email service
          if (context._mocks?.services?.emailService) {
            await context._mocks.services.emailService.call(
              "sendOrderConfirmation",
              {
                customerId: order.customerId,
                orderId: order.id,
                transactionId,
              }
            );
          }

          return { confirmationSent: true };
        },
      },
      {
        name: "scheduleShipping",
        execute: async (context, state) => {
          const { order } = context;

          // Mock shipping service
          if (context._mocks?.services?.shippingService) {
            const result = await context._mocks.services.shippingService.call(
              "scheduleShipment",
              {
                orderId: order.id,
                items: order.items,
                address: order.shippingAddress,
              }
            );

            return {
              shippingScheduled: true,
              trackingNumber: result.trackingNumber,
              estimatedDelivery: result.estimatedDelivery,
            };
          }

          return {
            shippingScheduled: true,
            trackingNumber: `TRK${Date.now()}`,
            estimatedDelivery: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          };
        },
      },
    ],
    contextRefresh: ["orderList", "inventoryStatus", "customerOrders"],
  },

  // Customer onboarding workflow
  onboardCustomer: {
    name: "onboardCustomer",
    description: "Complete customer onboarding process",
    steps: [
      {
        name: "validateCustomerData",
        execute: async (context) => {
          const { customer } = context;
          const required = ["email", "firstName", "lastName", "phone"];
          const missing = required.filter((field) => !customer[field]);

          if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(", ")}`);
          }

          return { validationPassed: true };
        },
      },
      {
        name: "createCustomerAccount",
        execute: async (context) => {
          const { customer } = context;

          const customerData = {
            ...customer,
            customerId: `CUST_${Date.now()}`,
            status: "active",
            createdAt: new Date().toISOString(),
            onboardingCompleted: false,
          };

          // Mock database operation
          if (context._mocks?.database) {
            const result = await context._mocks.database.execDml({
              method: "INSERT",
              table: "customers",
              data: customerData,
            });
            return {
              customerId: customerData.customerId,
              accountCreated: true,
            };
          }

          return { customerId: customerData.customerId, accountCreated: true };
        },
      },
      {
        name: "setupDefaultPreferences",
        execute: async (context, state) => {
          const { customerId } = state.data;

          const defaultPreferences = {
            customerId,
            emailNotifications: true,
            smsNotifications: false,
            marketingEmails: true,
            currency: "USD",
            language: "en",
          };

          // Mock database operation
          if (context._mocks?.database) {
            await context._mocks.database.execDml({
              method: "INSERT",
              table: "customer_preferences",
              data: defaultPreferences,
            });
          }

          return { preferencesSetup: true };
        },
      },
      {
        name: "sendWelcomePackage",
        execute: async (context, state) => {
          const { customer } = context;
          const { customerId } = state.data;

          // Mock email service
          if (context._mocks?.services?.emailService) {
            await context._mocks.services.emailService.call(
              "sendWelcomePackage",
              {
                customerId,
                email: customer.email,
                firstName: customer.firstName,
              }
            );
          }

          return { welcomePackageSent: true };
        },
      },
      {
        name: "completeOnboarding",
        execute: async (context, state) => {
          const { customerId } = state.data;

          // Mock database operation
          if (context._mocks?.database) {
            await context._mocks.database.execDml({
              method: "UPDATE",
              table: "customers",
              data: {
                onboardingCompleted: true,
                onboardingCompletedAt: new Date().toISOString(),
              },
              where: { customerId },
            });
          }

          return { onboardingCompleted: true };
        },
      },
    ],
    contextRefresh: ["customerList", "onboardingStats"],
  },
};

/**
 * Example 3: Error Handling and Recovery Workflows
 */
export const errorHandlingExamples = {
  // Resilient API call workflow
  resilientApiCall: {
    name: "resilientApiCall",
    description: "API call with retry logic and fallback strategies",
    steps: [
      {
        name: "primaryApiCall",
        timeout: 10000,
        execute: async (context) => {
          const { endpoint, data } = context;

          // Mock API service with potential failures
          if (context._mocks?.services?.apiService) {
            const result = await context._mocks.services.apiService.call(
              "makeRequest",
              {
                endpoint,
                data,
                timeout: 8000,
              }
            );

            return {
              apiResponse: result,
              source: "primary",
              success: true,
            };
          }

          // Simulate occasional failures for testing
          if (Math.random() < 0.3) {
            throw new Error("Primary API temporarily unavailable");
          }

          return {
            apiResponse: { data: "primary response" },
            source: "primary",
            success: true,
          };
        },
      },
      {
        name: "fallbackApiCall",
        condition: "success !== true",
        execute: async (context) => {
          const { endpoint, data } = context;

          log.warn("Primary API failed, attempting fallback", { endpoint });

          // Mock fallback API service
          if (context._mocks?.services?.fallbackApiService) {
            const result =
              await context._mocks.services.fallbackApiService.call(
                "makeRequest",
                {
                  endpoint,
                  data,
                }
              );

            return {
              apiResponse: result,
              source: "fallback",
              success: true,
            };
          }

          return {
            apiResponse: { data: "fallback response" },
            source: "fallback",
            success: true,
          };
        },
      },
      {
        name: "cacheResponse",
        condition: "success === true",
        execute: async (context, state) => {
          const { apiResponse, source } = state.data;

          // Mock cache service
          if (context._mocks?.services?.cacheService) {
            await context._mocks.services.cacheService.call("set", {
              key: `api_${context.endpoint}`,
              value: apiResponse,
              ttl: 300, // 5 minutes
            });
          }

          return { cached: true, cacheSource: source };
        },
      },
    ],
  },

  // Data processing with error recovery
  processDataWithRecovery: {
    name: "processDataWithRecovery",
    description:
      "Process data with automatic error recovery and partial success handling",
    steps: [
      {
        name: "validateInputData",
        execute: async (context) => {
          const { dataItems } = context;

          if (!Array.isArray(dataItems) || dataItems.length === 0) {
            throw new Error("Data items must be a non-empty array");
          }

          const validItems = [];
          const invalidItems = [];

          dataItems.forEach((item, index) => {
            if (item && typeof item === "object" && item.id) {
              validItems.push({ ...item, originalIndex: index });
            } else {
              invalidItems.push({
                item,
                index,
                reason: "Missing ID or invalid format",
              });
            }
          });

          return {
            validItems,
            invalidItems,
            totalItems: dataItems.length,
            validCount: validItems.length,
          };
        },
      },
      {
        name: "processValidItems",
        execute: async (context, state) => {
          const { validItems } = state.data;
          const processedItems = [];
          const failedItems = [];

          for (const item of validItems) {
            try {
              // Mock processing logic
              const processed = {
                ...item,
                processed: true,
                processedAt: new Date().toISOString(),
                processingTime: Math.random() * 100, // Mock processing time
              };

              // Simulate occasional processing failures
              if (Math.random() < 0.1) {
                throw new Error("Processing failed for item");
              }

              processedItems.push(processed);
            } catch (error) {
              failedItems.push({
                item,
                error: error.message,
                failedAt: new Date().toISOString(),
              });
            }
          }

          return {
            processedItems,
            failedItems,
            processedCount: processedItems.length,
            failedCount: failedItems.length,
          };
        },
      },
      {
        name: "retryFailedItems",
        condition: "failedCount > 0",
        execute: async (context, state) => {
          const { failedItems } = state.data;
          const retriedItems = [];
          const permanentFailures = [];

          for (const failedItem of failedItems) {
            try {
              // Retry with different strategy
              const retried = {
                ...failedItem.item,
                processed: true,
                processedAt: new Date().toISOString(),
                retryAttempt: true,
              };

              retriedItems.push(retried);
            } catch (error) {
              permanentFailures.push({
                ...failedItem,
                retryFailed: true,
                finalError: error.message,
              });
            }
          }

          return {
            retriedItems,
            permanentFailures,
            retriedCount: retriedItems.length,
            permanentFailureCount: permanentFailures.length,
          };
        },
      },
      {
        name: "generateProcessingReport",
        execute: async (context, state) => {
          const {
            totalItems,
            validCount,
            processedCount,
            failedCount,
            retriedCount = 0,
            permanentFailureCount = 0,
            invalidItems,
          } = state.data;

          const report = {
            summary: {
              totalItems,
              validItems: validCount,
              invalidItems: invalidItems.length,
              processedSuccessfully: processedCount + retriedCount,
              failedProcessing: permanentFailureCount,
              successRate: ((processedCount + retriedCount) / totalItems) * 100,
            },
            details: {
              invalidItems: invalidItems.length > 0 ? invalidItems : undefined,
              permanentFailures:
                permanentFailureCount > 0
                  ? state.data.permanentFailures
                  : undefined,
            },
            generatedAt: new Date().toISOString(),
          };

          return { processingReport: report };
        },
      },
    ],
  },
};

/**
 * Register all example workflows
 */
export function registerExampleWorkflows() {
  // Register CRUD examples
  Object.values(crudWorkflowExamples).forEach((workflow) => {
    workflowRegistry.register(workflow);
  });

  // Register business process examples
  Object.values(businessProcessExamples).forEach((workflow) => {
    workflowRegistry.register(workflow);
  });

  // Register error handling examples
  Object.values(errorHandlingExamples).forEach((workflow) => {
    workflowRegistry.register(workflow);
  });

  log.info("Example workflows registered", {
    crudWorkflows: Object.keys(crudWorkflowExamples).length,
    businessProcesses: Object.keys(businessProcessExamples).length,
    errorHandlingExamples: Object.keys(errorHandlingExamples).length,
  });
}

/**
 * Demonstrate workflow execution with different configurations
 */
export async function demonstrateWorkflowExecution() {
  log.info("Demonstrating workflow execution patterns...");

  try {
    // Example 1: Basic CRUD operation
    const createUserResult = await workflowRegistry.execute(
      "createUser",
      {
        email: "demo@example.com",
        name: "Demo User",
        role: "user",
        userID: "demo-creator",
      },
      getComponentWorkflowConfig("form")
    );

    log.info("Create user workflow result", createUserResult);

    // Example 2: Business process with dependencies
    const orderResult = await workflowRegistry.execute(
      "processOrder",
      {
        order: {
          id: "ORDER_123",
          customerId: "CUST_456",
          items: [
            { productId: "PROD_1", quantity: 2, price: 29.99 },
            { productId: "PROD_2", quantity: 1, price: 49.99 },
          ],
          shippingAddress: {
            street: "123 Demo St",
            city: "Demo City",
            state: "DC",
            zip: "12345",
          },
        },
        paymentMethod: {
          type: "credit_card",
          token: "card_token_123",
        },
      },
      getComponentWorkflowConfig("form")
    );

    log.info("Process order workflow result", orderResult);

    // Example 3: Error handling and recovery
    const resilientResult = await workflowRegistry.execute(
      "resilientApiCall",
      {
        endpoint: "/api/external/data",
        data: { query: "demo data" },
      },
      getComponentWorkflowConfig("editor")
    );

    log.info("Resilient API call result", resilientResult);
  } catch (error) {
    log.error("Workflow demonstration failed", { error: error.message });
  }
}

export default {
  crudWorkflowExamples,
  businessProcessExamples,
  errorHandlingExamples,
  registerExampleWorkflows,
  demonstrateWorkflowExecution,
};
