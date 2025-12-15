# CRUD Page Setup Onboarding Workflow

This document guides new developers and agents through the workflow for setting up a Create, Read, Update, Delete (CRUD) page. It covers required SQL setup, development instructions, integration with Studio's Query and Props tabs, as well as ongoing flexibility and future improvement notes.

---

## 1. Agent SQL Setup Steps

1. **Understand the Data Model**: Meet with data owners or review existing schemas to identify the necessary tables and fields.
2. **Define Tables and Columns**: Draft the tables, columns, and relationships needed for the CRUD page. Prefer using clear, semantic column names.
3. **Draft Migration SQL**: Prepare migration scripts for table creation and alteration using the organization’s preferred migration tool.
4. **Test Locally**: Apply migrations to a local or staging database for verification.
5. **Peer Review**: Submit your migration scripts for peer and/or data team review per project standards.
6. **Apply to Shared Environment**: After approval, apply migrations to development or staging environments.

---

## 2. Developer Instructions

1. **Clone & Update Repository**: Ensure you are on the correct branch related to your feature (`plan-74-studio-management-hub`).
2. **Scaffold CRUD Components**: Leverage existing templates or generators for CRUD components (forms, tables, modals, etc.).
3. **Connect to Data Layer**: Implement data access logic using the organization’s standard libraries (ORM, query builders, etc.).
4. **Security**: Implement all necessary authentication and authorization checks.
5. **Testing**: Write and run appropriate unit, integration, and end-to-end tests.
6. **Documentation**: Update or write documentation for new endpoints, components, props, or queries as necessary.

---

## 3. Studio Query/Props Integration

- **Studio Query Tab**: Use the Query tab to build, test, and iterate on backend data fetching. Link query logic directly to the CRUD components.
- **Studio Props Tab**: Define and test component props to ensure correct data passing, validation, and type safety.

> **Note:** The Studio Query and Props tabs reflect the current workflow for data and component connection. These tools will continue to evolve, and enhancements or broader abstractions may be introduced in the future.

---

## 4. Flexibility & Future Improvements

- The CRUD page setup process is intentionally flexible to adapt to project needs or tooling changes.
- **Handbook Contribution**: Please contribute updates or new workflows to this handbook as processes improve or the Studio’s features evolve.
- Be proactive in documenting deviations, best practices, and lessons learned from your onboarding or implementation.

---

**Last updated:** 2025-12-15
