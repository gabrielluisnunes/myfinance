# AI Engineering Playbook

This repository follows strict engineering principles to ensure scalable, maintainable, and production-ready software.

AI assistants must follow these rules when generating code.

---

# Core Philosophy

Before writing code, always follow this sequence:

1. Understand the problem
2. Design architecture
3. Model the data
4. Define module boundaries
5. Implement the solution
6. Refactor and improve

Never jump directly to coding.

---

# Architectural Principles

The system follows:

* modular architecture
* separation of concerns
* clean code practices
* scalable folder structure
* service oriented backend

Never mix responsibilities.

Examples of anti-patterns:

❌ Business logic inside controllers
❌ API calls directly inside UI components
❌ Database access inside controllers

Correct structure:

Controller → Service → Repository → Database

---

# Frontend Architecture Rules

Frontend must follow separation between:

* UI components
* data services
* hooks
* types

Example structure:

```
components/
services/
hooks/
types/
```

UI components must never contain business logic.

---

# Backend Architecture Rules

Backend modules must follow:

```
controllers/
services/
repositories/
middlewares/
utils/
```

Responsibilities:

Controllers → handle HTTP
Services → business logic
Repositories → database access

---

# API Rules

* Always validate input
* Always return structured responses
* Never expose internal errors
* Use consistent naming conventions

Example:

```
POST /leads
GET /leads
PATCH /leads/:id
```

---

# Commit Philosophy

Commits must be small and descriptive.

Examples:

```
feat(auth): implement login endpoint
fix(leads): correct lead status validation
refactor(api): extract lead service
```

---

# AI Behavior Rules

AI assistants must:

* read project architecture before coding
* respect folder structure
* avoid generating monolithic files
* prioritize maintainability
* explain important architectural decisions

Speed must never override code quality.
