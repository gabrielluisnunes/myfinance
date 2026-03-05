# Database Design

Database: **PostgreSQL** | ORM: **Prisma**

---

# Principles

- normalized schema
- clear relationships
- indexed queries
- monetary values as `Decimal(15,2)`

---

# Entities

```
User
 ├── Account (CHECKING | SAVINGS | CASH | CREDIT_CARD | INVESTMENT)
 │    └── CreditCard
 │         └── Invoice (OPEN | CLOSED | PAID)
 ├── Category (INCOME | EXPENSE)
 ├── Transaction → Account + Category + Invoice?
 ├── Transfer → fromAccount + toAccount
 ├── Budget (userId + categoryId + month + year)
 ├── Tag
 └── TransactionTag (pivot: Transaction ↔ Tag)
```

---

# Key Design Decisions

- `Transfer` is a separate entity from `Transaction` — transfers are not income/expense
- `Transaction` only has `INCOME` or `EXPENSE` types
- `Invoice` is unique per `(creditCardId, month, year)`
- `Budget` is unique per `(userId, categoryId, month, year)`
- Soft-delete via `isActive` on `Account` and `Category`

---

# Indexing

Always indexed:

- all foreign keys
- `email` on User
- `date` on Transaction and Transfer

---

# Migrations

Never change production schema manually.

Always use Prisma migrations:

```
npx prisma migrate dev --name <migration-name>
```
