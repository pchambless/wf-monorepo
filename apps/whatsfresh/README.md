# WhatsFresh Client

## Overview

The WhatsFresh Client is a React application that provides a modular, configurable interface for managing food production data. It uses a component-based architecture with reusable tab interfaces to create consistent user experiences across different data domains.

## Key Components

### Tab Navigation Systems

The application features two primary tab components:

- **HierTabs**: For hierarchical data relationships (parent-child relationships across tabs)
- **JustTabs**: For non-hierarchical, independent tab interfaces

### Core Architecture

- **Presenter Pattern**: Business logic is separated from UI components
- **Config-Driven Design**: Page layouts and behaviors are defined in configuration objects
- **Action System**: Global state management through a publish-subscribe pattern

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Tab Component Configuration

Tab-based pages are configured using standard patterns:

```javascript
const pageConfig = {
    pageName: 'Products',
    tabConfig: [
        {
            label: 'Product Types',
            columnMap: columnMap.ProductTypes,
            listEvent: 'prodTypeList',
            idField: 'prodTypeID'
        },
        // Additional tabs...
    ]
};
```

## Directory Structure

```
wf-client/
├── public/               # Static files and HTML template
├── src/
│   ├── actions/          # Action creators and event handlers
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Shared components used across features
│   │   ├── hiertabs/     # Hierarchical tab components
│   │   └── justtabs/     # Independent tab components
│   ├── config/           # Application configuration files
│   ├── pages/            # Page-level components
│   ├── presenters/       # Business logic separated from UI
│   ├── services/         # API and external service integrations
│   ├── styles/           # CSS and styling resources
│   ├── utils/            # Utility functions and helpers
│   ├── App.js            # Root application component
│   └── index.js          # Application entry point
├── tests/                # Test files and test utilities
├── docs/                 # Comprehensive documentation
├── .env                  # Environment variables
└── package.json          # Project dependencies and scripts
```

## Core Principles

1. **Consistency**: Similar operations work the same way across the application
2. **Modularity**: Components are designed to be reused across different contexts
3. **Configuration Over Code**: Behavior changes are primarily made through configuration
4. **Separation of Concerns**: UI components don't contain business logic

## Documentation

For comprehensive documentation about the application architecture, components, and usage, please see the [Documentation Hub](docs/README.md).

## Main Modules

- **Products**: Management of product definitions
- **Ingredients**: Management of ingredient data
- **Types**: Management of categorization systems
- **Accounts**: User and permission management

## License

[MIT License](LICENSE)
