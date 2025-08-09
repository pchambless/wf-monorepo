# WhatsFresh Plan Management App

Standalone plan management application running on port 3003.

## Overview

This is a focused application for plan management functionality, extracted from the main wf-client app for better separation of concerns and dedicated user experience.

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to @whatsfresh/shared-imports package

### Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm start
# or
npm run dev
```

The app will be available at http://localhost:3003

### Scripts

- `npm start` - Start development server on port 3003
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Architecture

### Phase 1: App Shell (Current)

- ✅ Basic app structure with Create React App + Craco
- ✅ Authentication integration using shared-imports
- ✅ Port 3003 configuration
- ✅ MainLayout integration
- ✅ Basic routing structure

### Phase 2: EventType Integration (Planned)

- Import plan eventTypes from shared-imports
- Configure routing for plan management pages
- Set up navigation for plan-focused workflow

### Phase 3: Component Migration (Planned)

- Port existing plan management components
- Integrate with plan eventTypes
- Full plan management functionality

### Phase 4: Optimization (Planned)

- Performance optimization
- Enhanced UX for standalone app
- Advanced plan management features

## Dependencies

### Core Dependencies

- React 18.3.1
- React Router DOM 7.0.1
- Material-UI 5.15.11
- @whatsfresh/shared-imports (local package)

### Build Tools

- Create React App with Craco
- Babel for shared-imports processing
- ESLint for code quality

## Configuration

- **Port**: 3003 (configured in .env and package.json)
- **Build Tool**: Create React App with Craco configuration
- **Shared Packages**: Uses @whatsfresh/shared-imports for auth, components, and utilities

## Project Structure

```
apps/wf-plan-management/
├── public/
│   └── index.html
├── src/
│   ├── config/
│   │   ├── routes.js
│   │   └── navigation.js
│   ├── layouts/
│   │   └── AuthLayout.jsx
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── craco.config.js
├── package.json
└── README.md
```

## Integration with Monorepo

This app is part of the WhatsFresh monorepo and:

- Shares authentication patterns with other apps
- Uses shared-imports package for common functionality
- Follows established architectural patterns
- Maintains clean separation from wf-client app
