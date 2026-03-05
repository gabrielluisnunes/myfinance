# Security Guidelines

Security must be considered in every layer.

---

# Authentication

Use secure authentication methods:

* JWT
* sessions
* OAuth

Never store plain passwords.

Always hash using:

```
bcrypt
argon2
```

---

# API Protection

All sensitive endpoints must require authentication.

Example:

```
POST /leads
PATCH /leads/:id
DELETE /leads/:id
```

---

# Input Validation

Validate all inputs using:

* schemas
* validation libraries

Never trust client data.

---

# Rate Limiting

Protect APIs from abuse.

Example:

* login endpoints
* public APIs

---

# Environment Variables

Never commit secrets.

Use:

```
.env
```

Add `.env` to `.gitignore`.

---

# Frontend Security

Avoid:

* exposing secrets
* storing tokens insecurely
