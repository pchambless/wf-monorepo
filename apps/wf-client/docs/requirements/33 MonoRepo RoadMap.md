# MonoRepo RoadMap

> Issue #33 | Created by pchambless | 5/23/2025

Steps to start a Monorepo for Whatsfresh

1. **wf-monorepo/**
├── apps/
│   ├── wf-client/
│   └── wf-server/
├── packages/
│   ├── api-contracts/  **<- Start here!**
│   └── validation/
2. **First Priority: Shared Event Types**
Your existing sample data is perfect for generating TypeScript interfaces
EventTypes are the natural starting point - used by both client and server
Client can use a version without SQL properties
Start with a simplified version and expand gradually
3. **Component Improvements**
:white_check_mark: Removed TableStore (eliminated duplicate columns)
Future: FormStore modularization into smaller, focused components
Keep the PageMap as the single source of truth
4. **Incremental Approach**
Create basic structure now (as a reminder)
Add one package at a time, starting with api-contracts
Minimal disruption to existing development workflow
TypeScript interfaces will provide immediate value
Enjoy your vacation! The code will be waiting for you when you get back. This monorepo approach will definitely help simplify your architecture and reduce duplication between your client and server applications.