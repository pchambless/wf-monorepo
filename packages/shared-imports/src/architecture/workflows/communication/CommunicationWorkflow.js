/**
 * Communication Flow Workflows
 *
 * Handles message creation and agent coordination modal triggers
 * Uses execDML for database operations (not eventTypes)
 */

import { workflowRegistry } from "../WorkflowRegistry.js";
import { createLogger } from "@whatsfresh/shared-imports";

const log = createLogger("CommunicationWorkflow");

/**
 * Create Communication Workflow
 * Creates a communication record and triggers coordination modal
 */
const createCommunicationWorkflow = {
  name: "createCommunication",
  steps: [
    {
      name: "validateCommunicationData",
      execute: async (context, state) => {
        log.debug("Validating communication data", {
          planId: context.planId,
          type: context.type,
          fromAgent: context.fromAgent,
        });

        const { planId, type, subject, message, fromAgent } = context;

        if (!planId) {
          throw new Error("Plan ID is required");
        }

        if (!type || !type.trim()) {
          throw new Error("Communication type is required");
        }

        if (!subject || !subject.trim()) {
          throw new Error("Subject is required");
        }

        if (!message || !message.trim()) {
          throw new Error("Message is required");
        }

        if (!fromAgent || !fromAgent.trim()) {
          throw new Error("From agent is required");
        }

        // Validate communication type
        const validTypes = [
          "strategic-input",
          "priority-change",
          "scope-modification",
          "issue-report",
          "completion-notice",
          "guidance-request",
        ];

        if (!validTypes.includes(type)) {
          throw new Error(
            `Invalid communication type. Must be one of: ${validTypes.join(
              ", "
            )}`
          );
        }

        // Validate agent
        const validAgents = ["user", "claude", "kiro"];
        if (!validAgents.includes(fromAgent.toLowerCase())) {
          throw new Error(
            `Invalid agent. Must be one of: ${validAgents.join(", ")}`
          );
        }

        // Determine recipient based on communication type and from agent
        const toAgent = this.determineRecipient(type, fromAgent);

        return {
          communicationData: {
            plan_id: planId,
            type: type.trim(),
            subject: subject.trim(),
            message: message.trim(),
            from_agent: fromAgent.toLowerCase(),
            to_agent: toAgent,
            priority: context.priority || "normal",
          },
        };
      },
    },

    {
      name: "createCommunicationRecord",
      execute: async (context, state) => {
        log.debug("Creating communication record", {
          communicationData: state.communicationData,
        });

        const { execDml } = await import("@whatsfresh/shared-imports/api");

        // Prepare data for execDML - follows the expected format
        const dmlRequest = {
          method: "INSERT",
          table: "api_wf.plan_communications",
          data: {
            ...state.communicationData,
            status: "sent",
            userID: context.userID || context.fromAgent || "system", // Agent name for plan operations
          },
          // primaryKey not needed for INSERT
          // listEvent could be added if we want to refresh a list after insert
        };

        const result = await execDml(dmlRequest);

        if (!result || !result.success) {
          throw new Error(
            result?.error || "Failed to create communication record"
          );
        }

        log.info("Communication record created", {
          communicationId: result.insertId,
          planId: state.communicationData.plan_id,
          type: state.communicationData.type,
        });

        return {
          communicationId: result.insertId,
          recipient: state.communicationData.to_agent,
          details: {
            description: `${state.communicationData.type} communication sent to ${state.communicationData.to_agent}`,
            subject: state.communicationData.subject,
          },
        };
      },
    },

    {
      name: "triggerCoordinationModal",
      execute: async (context, state) => {
        log.debug("Triggering coordination modal", {
          communicationId: state.communicationId,
          recipient: state.recipient,
        });

        const { modalCoordinator } = await import("./ModalCoordinator.js");

        const modalData = {
          id: state.communicationId,
          plan_id: state.communicationData.plan_id,
          from_agent: state.communicationData.from_agent,
          to_agent: state.recipient,
          subject: state.communicationData.subject,
          message: state.communicationData.message,
          type: state.communicationData.type,
          created_at: new Date().toISOString(),
        };

        // Determine modal scenario based on communication type and agents
        const scenario = this.determineModalScenario(
          state.communicationData.from_agent,
          state.recipient,
          state.communicationData.type
        );

        await modalCoordinator.trigger(scenario, modalData);

        log.info("Coordination modal triggered", {
          scenario,
          communicationId: state.communicationId,
        });

        return {
          modalTriggered: true,
          modalScenario: scenario,
        };
      },
    },
  ],

  contextRefresh: ["communicationHistory"],

  errorHandling: {
    retryable: ["createCommunicationRecord", "triggerCoordinationModal"],
    userFriendlyMessages: {
      "Plan ID is required":
        "Unable to identify the plan for this communication",
      "Communication type is required": "Please select a communication type",
      "Subject is required": "Please enter a subject for your message",
      "Message is required": "Please enter a message",
      "From agent is required": "Unable to identify the sender",
      "Invalid communication type": "Please select a valid communication type",
      "Invalid agent": "Invalid sender specified",
      "Failed to create communication record":
        "Unable to send message. Please try again.",
      "Database connection failed":
        "Unable to save message. Please check your connection.",
    },
  },

  // Helper methods for the workflow
  determineRecipient(type, fromAgent) {
    // Logic to determine who should receive the communication
    const fromAgentLower = fromAgent.toLowerCase();

    switch (type) {
      case "strategic-input":
      case "guidance-request":
        return fromAgentLower === "user" ? "claude" : "user";

      case "issue-report":
        // Issues typically go to the appropriate agent based on context
        return fromAgentLower === "user" ? "kiro" : "user";

      case "completion-notice":
        return fromAgentLower === "kiro" ? "claude" : "user";

      case "priority-change":
      case "scope-modification":
        return "claude"; // Strategic decisions go to Claude

      default:
        return fromAgentLower === "user" ? "claude" : "user";
    }
  },

  determineModalScenario(fromAgent, toAgent, type) {
    // Determine the appropriate modal scenario for coordination
    if (fromAgent === "user" && toAgent === "claude") {
      return type === "issue-report" ? "user-issue" : "user-guidance";
    }

    if (fromAgent === "user" && toAgent === "kiro") {
      return "user-issue";
    }

    if (fromAgent === "kiro" && toAgent === "claude") {
      return "kiro-completion";
    }

    if (fromAgent === "claude" && toAgent === "user") {
      return "claude-guidance";
    }

    // Default scenario
    return "agent-coordination";
  },
};

/**
 * Update Communication Status Workflow
 * Updates communication status (read, acknowledged, etc.)
 */
const updateCommunicationStatusWorkflow = {
  name: "updateCommunicationStatus",
  steps: [
    {
      name: "validateStatusUpdate",
      execute: async (context, state) => {
        log.debug("Validating status update", {
          communicationId: context.communicationId,
          status: context.status,
        });

        if (!context.communicationId) {
          throw new Error("Communication ID is required");
        }

        if (!context.status) {
          throw new Error("Status is required");
        }

        const validStatuses = [
          "sent",
          "read",
          "acknowledged",
          "completed",
          "archived",
        ];
        if (!validStatuses.includes(context.status)) {
          throw new Error(
            `Invalid status. Must be one of: ${validStatuses.join(", ")}`
          );
        }

        return {
          communicationId: context.communicationId,
          status: context.status,
          updatedBy: context.userID || "system",
        };
      },
    },

    {
      name: "updateCommunicationRecord",
      execute: async (context, state) => {
        log.debug("Updating communication status", {
          communicationId: state.communicationId,
          status: state.status,
        });

        const { execDml } = await import("@whatsfresh/shared-imports/api");

        // Prepare data for execDML - follows the expected format
        const dmlRequest = {
          method: "UPDATE",
          table: "api_wf.plan_communications",
          data: {
            id: parseInt(state.communicationId), // Primary key for WHERE clause
            status: state.status,
            userID: state.updatedBy, // Agent name for plan operations
          },
          primaryKey: parseInt(state.communicationId),
        };

        const result = await execDml(dmlRequest);

        if (!result || !result.success) {
          throw new Error(
            result?.error || "Failed to update communication status"
          );
        }

        log.info("Communication status updated", {
          communicationId: state.communicationId,
          status: state.status,
          affectedRows: result.affectedRows,
        });

        return {
          updated: true,
          affectedRows: result.affectedRows,
        };
      },
    },
  ],

  contextRefresh: ["communicationHistory"],

  errorHandling: {
    retryable: ["updateCommunicationRecord"],
    userFriendlyMessages: {
      "Communication ID is required":
        "Unable to identify the communication to update",
      "Status is required": "Please specify a status",
      "Invalid status": "Please select a valid status",
      "Failed to update communication status":
        "Unable to update status. Please try again.",
    },
  },
};

// Register workflows with the registry
workflowRegistry.register("createCommunication", createCommunicationWorkflow);
workflowRegistry.register(
  "updateCommunicationStatus",
  updateCommunicationStatusWorkflow
);

log.info("Communication workflows registered", {
  workflows: ["createCommunication", "updateCommunicationStatus"],
});

// Export workflows for testing
export { createCommunicationWorkflow, updateCommunicationStatusWorkflow };
