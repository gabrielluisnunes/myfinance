# Architecture Thinking Framework

Before implementing any feature, follow this thinking process.

---

# Step 1 — Understand the Problem

Ask:

* What problem are we solving?
* Who are the users?
* What are the constraints?

---

# Step 2 — Define System Boundaries

Identify:

* frontend responsibilities
* backend responsibilities
* database responsibilities

---

# Step 3 — Identify Core Entities

Example:

```
User
Workspace
Lead
FollowUp
Activity
```

---

# Step 4 — Define Data Flow

Example:

User action → API → Service → Repository → Database

---

# Step 5 — Design Modules

Break system into modules.

Example:

```
auth
users
leads
followups
activities
```

---

# Step 6 — Plan Scalability

Consider:

* caching
* pagination
* indexing
* background jobs
