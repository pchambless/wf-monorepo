# WhatsFresh Client Documentation

## Documentation Structure

This documentation provides comprehensive information about the WhatsFresh Client application, a React-based system for managing food production data.

### Table of Contents

1. **[Getting Started](getting-started.md)**
   - Installation and setup
   - Development workflow
   - Project navigation

2. **[Architecture](architecture/README.md)**
   - [Component Structure](architecture/components.md)
   - [Presenters](architecture/presenters.md)
   - [Action System](architecture/actions.md)

3. **[Tab Systems](tab-systems/README.md)**
   - [Hierarchical Tabs](tab-systems/hier-tabs.md)
   - [Non-Hierarchical Tabs](tab-systems/just-tabs.md)

4. **[Data Models](models/README.md)**
   - Core data structures
   - Data relationships
   - Validation rules

5. **[API Integration](api/README.md)**
   - API service patterns
   - Endpoint documentation
   - Authentication and error handling

6. **Module-Specific Documentation**
   - [Types Module](../src/pages/types/README.md)
   - Products Module
   - Ingredients Module
   - Accounts Module

## Overview

The WhatsFresh Client is a modular React application that provides interfaces for managing food production data. It uses a component-based architecture with reusable tab interfaces to create consistent user experiences across different data domains.

### Key Features

- **Modular Design**: Each business domain has a dedicated module with consistent patterns
- **Hierarchical Data Management**: Parent-child relationships are handled through connected tabs
- **Config-Driven UI**: Most UI structures are defined in configuration objects
- **Consistent CRUD Operations**: Standard patterns for Create, Read, Update, Delete across all data types
- **Presenter Pattern**: Business logic is separated from UI components

## Core Principles

1. **Consistency**: Similar operations work the same way across the application
2. **Modularity**: Components are designed to be reused across different contexts
3. **Configuration Over Code**: Behavior changes are primarily made through configuration
4. **Separation of Concerns**: UI components don't contain business logic

## Quick Links

- [Project README](../README.md) - Project overview and basic setup
- [GitHub Repository](https://github.com/whatsfresh/wf-client) - Source code repository
- [Issue Tracker](https://github.com/whatsfresh/wf-client/issues) - Report bugs and feature requests
- [Changelog](changelog.md) - History of changes and releases

## Contributing to Documentation

To contribute to this documentation:

1. Create or edit Markdown files in the appropriate directories
2. Follow the existing format and style
3. Update the central Table of Contents when adding new pages
4. Use relative links for cross-referencing other documentation pages
5. Include code examples where appropriate
