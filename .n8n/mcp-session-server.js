#!/usr/bin/env node

/**
 * MCP Server for Session Startup
 * Exposes session-startup as an MCP resource that auto-loads on agent initialization
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const SESSION_STARTUP_URL = 'http://localhost:5678/webhook/session-startup';

class SessionStartupServer {
  constructor() {
    this.server = new Server(
      {
        name: 'session-startup-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
        },
      }
    );

    this.setupResourceHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async () => ({
        resources: [
          {
            uri: 'session://startup',
            name: 'Agent Session Startup',
            description: 'Pre-aggregated session context: protocol, active plans, recent activity',
            mimeType: 'application/json',
          },
        ],
      })
    );

    // Read resource content
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        if (request.params.uri !== 'session://startup') {
          throw new Error(`Unknown resource: ${request.params.uri}`);
        }

        try {
          const response = await fetch(SESSION_STARTUP_URL);
          const data = await response.json();

          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(data[0].session_context, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to fetch session startup: ${error.message}`);
        }
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Session Startup MCP server running on stdio');
  }
}

const server = new SessionStartupServer();
server.run().catch(console.error);
