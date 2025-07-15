# WhatsFresh 2.0 - Food Production Management System

> WhatsFresh 2.0 represents the evolution from a single-tenant, manually-provisioned system to a multi-tenant, self-service SaaS platform. While the core business logic remains proven and mature, the architecture has been redesigned to support internet-scale user registration, account management, and multi-tenant data isolation. The Admin app serves as the operational backbone for managing the complexities of multi-tenant provisioning that were previously handled manually in WhatsFresh 1.0.

## 🎯 Overview

WhatsFresh 2.0 helps food producers manage their entire operation from ingredients to finished products:

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
│   ├── shared-api/         # Server utilities & API helpers
│   ├── shared-events/      # Event definitions & handlers
│   └── devtools/           # Code generation & documentation
└── sql/views/              # Database views organized by app
```

### Key Features (2025 Updates)
- ✅ **Generation-First Architecture** - All configs generated from SQL views
- ✅ **EventType-Driven Navigation** - Dynamic routing & components from database events
- ✅ **Centralized DevTools** - Single source of truth for code generation
- ✅ **App-Specific Configs** - No shared artifacts, only app-specific code
- ✅ **Shared UI Components** - Reusable navigation, authentication & forms
- ✅ **Clean Import Hub** - shared-imports package for monorepo coordination
- ✅ **Docker Development** - Consistent environment with hot reload

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

### Development Scripts
```bash
npm run dev              # Start all development servers
npm run build            # Build all apps for production

# Code Generation (DevTools)
npm run generate-client  # Generate all client app configs
npm run generate-admin   # Generate all admin app configs
npm run generate-docs    # Generate comprehensive documentation
```

### Docker Commands
```bash
docker-compose up        # Start all services
docker-compose build     # Rebuild containers
docker-compose logs      # View service logs
```

## 📚 Documentation Strategy

WhatsFresh 2.0 employs a **multi-layered documentation approach** that grows with the architecture:

### 🏛️ **[Architectural Evolution](./claude-plans/b-completed/index.md)**
- **Living Documentation** - Real problem-solving history and architectural decisions
- **Implementation Plans** - Completed solutions that shape current architecture
- **Onboarding Foundation** - Natural learning path from actual development evolution

### 🔗 **[DevTools Documentation](./packages/devtools/README.md)**
- **Generation Workflow** - SQL views → UI configs → App-specific code
- **Architecture Overview** - Generation-first philosophy and benefits
- **CLI Commands** - Complete guide to code generation tools
- **Developer Workflow** - When and how to regenerate configurations

### 🔗 **[Generated Documentation](./packages/devtools/docs/generated/index.html)**
- **Live Page Previews** - See exactly how your pages will look
- **Widget Gallery** - Browse all available UI components  
- **System Architecture** - Visual overview of the entire system
- **EventTypes Flow** - Interactive mermaid diagrams showing system relationships

### 📋 **[Development Guidelines](./CLAUDE.md)**
- **Project Context** - Monorepo structure and component organization
- **MVP Development Philosophy** - Break-and-fix approach and no backward compatibility
- **Generation Commands** - DevTools CLI usage and automation workflows
- **Session Management** - Development planning and progress tracking

## 🐳 Docker Development

The entire monorepo is containerized for consistent development:

- **Hot Reload**: Source changes automatically reload
- **Isolated Dependencies**: Each service has its own node_modules
- **Shared Packages**: Monorepo packages mounted for cross-service usage
- **Development Ready**: Pre-configured with all necessary tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes following our [DevTools documentation](./packages/devtools/README.md)
4. Regenerate configs if needed (`npm run generate-client`)
5. Commit with conventional commits (`feat:`, `fix:`, `docs:`, etc.)
6. Push and create a Pull Request

## 📄 License

[Add your license information here]

## 🆘 Support

- **Documentation**: [DevTools README](./packages/devtools/README.md)
- **Issues**: [GitHub Issues](../../issues)  
- **Discussions**: [GitHub Discussions](../../discussions)

---

**💡 New to the project?** Start with the [Architectural Evolution](./claude-plans/b-completed/index.md) to understand how WhatsFresh 2.0 evolved, then dive into [DevTools Documentation](./packages/devtools/README.md) for technical implementation details.