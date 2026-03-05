# Code Review Guidelines

Every pull request must be reviewed with the following criteria.

---

# Architecture

Does the code respect system architecture?

Check:

* correct module boundaries
* service layer usage
* repository pattern usage

---

# Code Quality

Verify:

* clear variable names
* readable functions
* no duplicated logic

---

# Complexity

Functions should be small.

Avoid functions larger than ~50 lines.

---

# Security

Verify:

* input validation
* authentication checks
* no sensitive data exposed

---

# Maintainability

Ask:

Can another engineer understand this code easily?
