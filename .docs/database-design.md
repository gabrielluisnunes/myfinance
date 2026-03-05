# Database Design

Database must prioritize consistency and scalability.

---

# Principles

* normalized schema
* clear relationships
* indexed queries

---

# Example Entities

```
User
Workspace
Lead
FollowUp
Activity
```

---

# Relationships

Workspace → Users
Workspace → Leads
Lead → FollowUps

---

# Indexing

Always index:

* foreign keys
* frequently queried fields

Example:

```
email
workspaceId
createdAt
```

---

# Migrations

Never change production schema manually.

Always use migrations.
