# API Design Guidelines

APIs must follow REST conventions.

---

# Endpoint Naming

Use plural resources.

```
GET /users
GET /leads
POST /leads
PATCH /leads/:id
```

---

# Response Format

Always return structured responses.

Example:

```
{
  "data": {...},
  "meta": {...}
}
```

---

# Error Format

```
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email is required"
  }
}
```

---

# Pagination

Always support pagination for lists.

```
GET /leads?page=1&limit=20
```

---

# Versioning

Support API versioning.

```
/api/v1/leads
```
