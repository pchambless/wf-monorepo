# WhatsFresh Monorepo Documentation

Welcome to the WhatsFresh monorepo documentation. This repository contains a modern, event-driven architecture for building scalable business applications.

## Quick Navigation

### 🏗️ Architecture
- [**System Overview**](./architecture/overview.md) - Complete architecture explanation
- [EventTypes Guide](./architecture/event-types.md) - Event-driven patterns
- [Schema-Driven UI](./architecture/schema-driven-ui.md) - Database → UI automation
- [Monorepo Structure](./architecture/monorepo-structure.md) - Apps and packages

### 🛠️ Development
- [Getting Started](./development/getting-started.md) - Quick start guide
- [Creating New Apps](./development/creating-new-apps.md) - Using templates
- [Component Development](./development/component-development.md) - Building components

### 📱 Applications
- [wf-server](./apps/wf-server.md) - Backend API and eventTypes
- [wf-plan-management](./apps/wf-plan-management.md) - Frontend prototype app
- [wf-studio](./apps/wf-studio.md) - Visual page design tool

## Architecture Highlights

**Event-Driven Design** - Everything is built around eventTypes that define both server queries and UI components.

**Schema-Driven UI** - Database schemas automatically generate form layouts, validation, and display configurations.

**Prototype-First** - wf-plan-management serves as the template for all future apps (wf-client, wf-admin, etc.).

**Component Sharing** - shared-imports package provides reusable components across all apps.

**Visual Design** - wf-studio allows visual page design while maintaining the event-driven architecture.

## Current Focus

We're concentrating on **plans events** as the foundation:
- Server-side plan queries (planList, planDtl, planCommList, etc.)
- Frontend plan management with tabs, grids, and forms
- Complete CRUD operations with workflow integration

## Getting Started

1. **Understand the Architecture** - Start with [System Overview](./architecture/overview.md)
2. **Explore Plans Events** - Check [wf-plan-management](./apps/wf-plan-management.md) 
3. **Run the Prototype** - Follow [Getting Started](./development/getting-started.md)

---

*This documentation reflects the current state of the monorepo as of August 2025.*