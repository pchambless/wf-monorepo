# WhatsFresh 2.0 - Food Production Management System

## 🌱 What is WhatsFresh?

WhatsFresh helps small food producers manage their operations—from ingredient tracking to batch mapping and product compliance—all in one place. It started as a tool tailored for a single business, but version 2.0 opens things up to everyone with a scalable, self-service platform. The goal is to preserve what worked in the original system while adding flexibility, cleaner data management, and better traceability features for teams on the ground.

## 👥 Who It’s For

Designed for small food businesses and kitchen teams who need clarity and control over day-to-day production. Whether you’re overseeing recipes, tracking batches, or onboarding team members, WhatsFresh makes complex workflows easier to manage and repeat.

## 📈 Where It’s Going

We’re continuing to build on the foundations of WhatsFresh 1.0—adding new features like enhanced reporting, smarter automation, and other improvements inspired by the real-world feedback of producers who use the system. The roadmap is collaborative and shaped by need.

## 💡 Want to Get Involved?

WhatsFresh is growing. If you're passionate about building tools that empower small businesses and improve transparency, we’d love to hear from you. Whether you're curious or hands-on, you can explore the [DevTools README](./packages/devtools/README.md) to see how everything fits together.

## 🎯 Overview

WhatsFresh 2.0 helps food producers manage their entire operation from ingredients to finished products:

- **📦 Ingredient Management** – Track types, batches, vendors, and inventory  
- **🍽️ Product Management** – Manage products, recipes, and production batches  
- **👥 User Management** – Multi-account system with role-based access  
- **📊 Production Tracking** – Monitor batch progress and compliance  
- **🔄 Batch Mapping** – Link ingredients to finished products for traceability

## 🏗️ How It's Built

WhatsFresh 2.0 is organized as a single, unified codebase—known as a monorepo—which simply means all the apps, tools, and shared code live in one place. This makes it easier to keep things consistent, reuse components, and onboard new collaborators quickly.

Here’s how the core pieces fit together:
```plaintext
 ├── apps/ │ 
 ├── wf-client/ # Frontend for food producers and staff 
 │ ├── wf-admin/ # Frontend for system administrators 
 │ └── wf-server/ # Backend API shared across apps 
 ├── packages/ 
 │ ├── shared-imports/ # Common utilities used by all apps 
 │ └── devtools/ # Tools for generating code and documentation 
 └── sql/views/ # Organized database views that drive the UI
 ```


Each part plays a distinct role—from powering user interfaces to handling backend logic, all stitched together by shared tools and database-driven configurations.

## 🧠 Design Philosophy

WhatsFresh 2.0 is being built with flexibility and future-proofing in mind. Here's how we've designed the system to support both users and developers:

- **SQL-Driven Everything**  
  All configurations—from page layouts to routing—are generated dynamically from database views. This means faster iteration and fewer manual updates.

- **Event-Based Navigation**  
  System behavior and page structure adapt to real-time events in the database, so the interface is always aligned with the data.

- **Focused, Modular Architecture**  
  Each app (Client, Admin, Server) has its own isolated config and codebase, with no shared artifacts. Yet they all pull from common tools and UI components to stay consistent.

- **Centralized DevTools**  
  Everything from code generation to documentation lives in one developer toolkit, simplifying onboarding and automation.

- **Clean Development Workflow**  
  The monorepo setup, Docker containers, and shared utilities make development smoother—hot reloads, clean imports, and isolated dependencies included.


## 🛠️ Developer Onboarding

Curious about how the system works under the hood?  
Explore the [DevTools README](./packages/devtools/README.md) for setup instructions, code generation tools, and everything needed to get your environment running.

## 🛠️ Applications

### Client App (Port 3000)
Built for food producers and kitchen staff, the Client App makes it easy to manage ingredients, production batches, and recipes—keeping day-to-day operations streamlined and traceable.

### Admin App (Port 3002)
Designed for system administrators, the Admin App handles user management, account setup, and system configuration. It’s the operational backbone that keeps the platform organized.

### Server API (Port 3001)
This shared backend powers both the Client and Admin apps. It manages authentication, processes data, and supports event-driven features that tie the entire system together.


## 📚 Learning & Documentation

The WhatsFresh documentation is more than static instructions—it's a living record of how the platform grows, adapts, and solves real-world problems. As new tools and workflows take shape, the docs evolve too.

Here’s how you can explore and learn:

- **Architectural Evolution**  
  Dive into the history and problem-solving journey that shaped WhatsFresh 2.0—from initial plans to completed solutions. Great for understanding how we think and build.

- **DevTools Handbook**  
  Curious how SQL views turn into pages and components? This guide walks through the code generation workflow, architecture choices, and when to trigger updates.

- **Live System Previews**  
  Browse UI components, view generated pages, and explore interactive diagrams that connect ingredients to products through traceable events.

- **Development Guidelines**  
  Learn about our break-and-fix philosophy, session planning strategies, and the logic behind the monorepo organization. Perfect for onboarding and contribution.


## 📄 License

[Add your license information here]

## 🆘 Support

- **Documentation**: [DevTools README](./packages/devtools/README.md)
- **Issues**: [GitHub Issues](../../issues)  
- **Discussions**: [GitHub Discussions](../../discussions)

---

**💡 New to the project?** Start with the [Architectural Evolution](./claude-plans/b-completed/index.md) to understand how WhatsFresh 2.0 evolved, then dive into [DevTools Documentation](./packages/devtools/README.md) for technical implementation details.