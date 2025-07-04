# WhatsFresh - Food Production Management System

A comprehensive monorepo for managing food production, ingredient tracking, recipe management, and batch operations. Built with modern React/Node.js architecture and Docker containerization.

## 🎯 Overview

WhatsFresh helps food producers manage their entire operation from ingredients to finished products:

- **📦 Ingredient Management** - Track types, batches, vendors, and inventory
- **🍽️ Product Management** - Manage products, recipes, and production batches  
- **👥 User Management** - Multi-account system with role-based access
- **📊 Production Tracking** - Monitor batch progress and compliance
- **🔄 Batch Mapping** - Link ingredients to finished products for traceability

## 🏗️ Architecture

### Modern Monorepo Structure
```
├── apps/
│   ├── wf-client/          # React frontend (Client app)
│   ├── wf-admin/           # React frontend (Admin app)
│   └── wf-server/          # Node.js/Express API
├── packages/
│   ├── shared-imports/     # Centralized utilities & dependencies
│   ├── shared-ui/          # Reusable React components
│   ├── shared-config/      # Configuration management
│   └── devtools/           # Development automation & docs
└── sql/views/              # Database views organized by app
```

### Key Features (2025 Updates)
- ✅ **Centralized Shared-Imports** - DRY principle across all apps
- ✅ **Shared UI Components** - Reusable authentication & forms
- ✅ **Modular DML System** - Clean data manipulation with previews
- ✅ **Docker Development** - Consistent environment with hot reload
- ✅ **Simplified Stores** - MVP approach, self-sufficient components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MySQL database

### Development with Docker (Recommended)
```bash
# Clone repository
git clone <repository-url>
cd wf-monorepo-new

# Start all services
docker-compose up

# Access applications
# Client App: http://localhost:3000
# Server API: http://localhost:3001
```

### Local Development
```bash
# Install dependencies
npm install

# Start development servers
npm run dev:client    # React client (port 3000)
npm run dev:server    # Node.js server (port 3001)
```

## 🛠️ Applications

### Client App (Port 3000)
- **Target Users**: Food producers, kitchen staff
- **Features**: Ingredient tracking, production batches, recipe management
- **Tech**: React 18, MUI, MobX, Docker

### Admin App (Port 3002)
- **Target Users**: System administrators  
- **Features**: User management, account setup, system configuration
- **Tech**: React 18, MUI, role-based authentication

### Server API (Port 3001)
- **Purpose**: Unified API for both client and admin apps
- **Features**: Authentication, data operations, event handling
- **Tech**: Node.js, Express, ES modules, MySQL

## 🧑‍💻 Development

### Package Scripts
```bash
npm run dev              # Start all development servers
npm run build            # Build all apps for production
npm run generate-docs    # Generate development documentation
npm run generate-pages   # Generate page configurations
```

### Docker Commands
```bash
docker-compose up        # Start all services
docker-compose build     # Rebuild containers
docker-compose logs      # View service logs
```

## 📚 Detailed Documentation

**For comprehensive technical documentation, architecture details, and development guides:**

### 🔗 **[Developer Documentation](./packages/devtools/src/docs/README.md)**

The detailed docs include:
- **Architecture Deep Dive** - Recent improvements, shared-imports, DML system
- **Component Library** - Widget registry, UI components
- **Docker Setup** - Container configuration, development workflow  
- **Development Guidelines** - React patterns, conventions, best practices
- **API Documentation** - Event types, database operations
- **Visual Previews** - Generated page documentation

## 🐳 Docker Development

The entire monorepo is containerized for consistent development:

- **Hot Reload**: Source changes automatically reload
- **Isolated Dependencies**: Each service has its own node_modules
- **Shared Packages**: Monorepo packages mounted for cross-service usage
- **Development Ready**: Pre-configured with all necessary tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes following our [development guidelines](./packages/devtools/src/docs/README.md#development-guidelines)
4. Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
5. Push and create a Pull Request

## 📄 License

[Add your license information here]

## 🆘 Support

- **Documentation**: [Developer Docs](./packages/devtools/src/docs/README.md)
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)

---

**💡 New to the project?** Start with the [Developer Documentation](./packages/devtools/src/docs/README.md) for a comprehensive overview of the architecture and development setup.