# WhatsFresh Shared Imports Package

The consolidated shared utilities and components package for the WhatsFresh monorepo.

## Purpose

This package consolidates all shared code (JavaScript utilities, React components, API utilities, and event definitions) into a single package with clean export paths.

## Usage

### JavaScript Utilities

```javascript
import { createLogger, configureLogger } from '@whatsfresh/shared-imports';
```

### React Components

```javascript
import { Modal, MainLayout, ErrorBoundary } from '@whatsfresh/shared-imports/jsx';
```

### API Utilities

```javascript
import { createApi, execEvent } from '@whatsfresh/shared-imports/api';
```

### Event Types

```javascript
import { eventTypes } from '@whatsfresh/shared-imports/events';
```

## Structure

- `src/components/` - React UI components
- `src/layouts/` - Layout components
- `src/server/` - API utilities
- `src/events/` - Event type definitions
- `src/utils/` - General JavaScript utilities

## Exports

The package provides multiple entry points for clean imports:

- `@whatsfresh/shared-imports` - Core JavaScript utilities
- `@whatsfresh/shared-imports/jsx` - React components
- `@whatsfresh/shared-imports/api` - API utilities
- `@whatsfresh/shared-imports/events` - Event definitions
- `@whatsfresh/shared-imports/utils` - Utility functions
