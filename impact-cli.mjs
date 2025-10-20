#!/usr/bin/env node
/**
 * CLI tool for impact logging
 * Usage:
 *   node impact-cli.mjs add create "path/to/file.js" "Description" "app1,app2"
 *   node impact-cli.mjs submit
 *   node impact-cli.mjs list
 *   node impact-cli.mjs cleanup
 */

import {
  FileImpactLogger,
  createSession,
} from "./packages/shared-imports/src/api/impactFileLogger.js";

const [, , command, ...args] = process.argv;

const showUsage = () => {
  console.log(`
🎯 Impact Logging CLI

Usage:
  node impact-cli.mjs add <type> <file> <description> [apps]
  node impact-cli.mjs submit [session-name]
  node impact-cli.mjs list
  node impact-cli.mjs cleanup [session-name]

Examples:
  # Add impacts to current session
  node impact-cli.mjs add create "apps/server/new.js" "Created new endpoint" "server"
  node impact-cli.mjs add modify "apps/client/old.js" "Fixed bug" "client"
  
  # Submit all impacts and cleanup
  node impact-cli.mjs submit
  
  # List pending sessions
  node impact-cli.mjs list
  
  # Clean up specific session without submitting
  node impact-cli.mjs cleanup kiro-20251018-1430
`);
};

const addImpact = async (changeType, filePath, description, apps = "") => {
  try {
    const session = createSession();
    await session.loadFromFile();

    const affectedApps = apps ? apps.split(",").map((s) => s.trim()) : [];

    await session.addImpact({
      filePath,
      changeType,
      description,
      affectedApps,
      createdBy: "kiro",
    });

    console.log(`✅ Added ${changeType}: ${filePath}`);
    console.log(`📝 Description: ${description}`);
    console.log(
      `📊 Session: ${session.sessionName} (${session.impacts.length} impacts)`
    );
  } catch (error) {
    console.error("❌ Failed to add impact:", error.message);
  }
};

const submitImpacts = async (sessionName = null) => {
  try {
    let session;

    if (sessionName) {
      session = await FileImpactLogger.loadSession(sessionName);
    } else {
      const files = await FileImpactLogger.listPendingFiles();
      if (files.length === 0) {
        console.log("📭 No pending sessions to submit");
        return;
      }
      const latestSession = files[files.length - 1].replace(".json", "");
      session = await FileImpactLogger.loadSession(latestSession);
    }

    if (session.impacts.length === 0) {
      console.log("📭 No impacts to submit");
      return;
    }

    console.log(
      `🚀 Submitting ${session.impacts.length} impacts from ${session.sessionName}...`
    );

    const result = await session.submitAndCleanup();

    console.log("✅ Successfully submitted impacts!");
    console.log(`📊 Batch ID: ${result.batchId}`);
    console.log(`📈 Count: ${result.count}`);
  } catch (error) {
    console.error("❌ Failed to submit impacts:", error.message);
    console.log("💡 Temp file preserved for retry");
  }
};

const listPending = async () => {
  try {
    const files = await FileImpactLogger.listPendingFiles();

    if (files.length === 0) {
      console.log("📭 No pending impact files");
      return;
    }

    console.log(`📋 Pending impact sessions (${files.length}):`);

    for (const file of files) {
      const sessionName = file.replace(".json", "");
      const session = await FileImpactLogger.loadSession(sessionName);
      console.log(`  📁 ${sessionName} - ${session.impacts.length} impacts`);
    }
  } catch (error) {
    console.error("❌ Failed to list pending files:", error.message);
  }
};

const cleanupSession = async (sessionName = null) => {
  try {
    const session = sessionName
      ? await FileImpactLogger.loadSession(sessionName)
      : createSession();

    if (!sessionName) {
      await session.loadFromFile();
    }

    await session.cleanup();
    console.log(`🧹 Cleaned up session: ${session.sessionName}`);
  } catch (error) {
    console.error("❌ Failed to cleanup:", error.message);
  }
};

// Main command handler
switch (command) {
  case "add":
    if (args.length < 3) {
      console.error("❌ Usage: add <type> <file> <description> [apps]");
      process.exit(1);
    }
    await addImpact(args[0], args[1], args[2], args[3]);
    break;

  case "submit":
    await submitImpacts(args[0]);
    break;

  case "list":
    await listPending();
    break;

  case "cleanup":
    await cleanupSession(args[0]);
    break;

  default:
    showUsage();
    process.exit(1);
}
