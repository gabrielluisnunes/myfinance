# Engineering Guidelines

This project follows professional engineering practices used in modern SaaS companies.

---

# Code Philosophy

Priorities:

1. readability
2. maintainability
3. modularity
4. scalability

Never optimize prematurely.

---

# Code Organization

Each module must have a clear responsibility.

Example backend module:

```
modules/leads
├── leads.controller.ts
├── leads.service.ts
├── leads.repository.ts
```

---

# Avoid

❌ God files
❌ Business logic in controllers
❌ Duplicate code

---

# Prefer

✔ small functions
✔ descriptive names
✔ modular architecture

---

# Naming Conventions

Functions → verbs

```
createLead()
updateLeadStatus()
listLeads()
```

Variables → descriptive

```
leadRepository
userService
authToken
```

Never use unclear names like:

```
data
temp
value
```

---

# Scalability Mindset

Write code as if the project will grow to:

* multiple teams
* thousands of users
* multiple services
