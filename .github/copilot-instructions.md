# Copilot Instructions

GitHub Copilot must follow the engineering guidelines of this repository.

---

# Behavior Rules

Before generating code:

1. read AI_PLAYBOOK.md
2. read architecture documentation

---

# Code Generation Rules

Copilot must:

* respect folder structure
* generate modular code
* avoid monolithic files
* prioritize maintainability

---

# Architecture Rules

Never place:

* business logic in controllers
* database calls in UI

Follow:

Controller → Service → Repository
