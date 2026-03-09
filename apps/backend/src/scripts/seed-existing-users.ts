/**
 * One-time migration script.
 * Adds default categories and a main account to users who don't have them yet.
 *
 * Run with:
 *   npx tsx --env-file=../../.env src/scripts/seed-existing-users.ts
 */

import { prisma } from "@myfinance/db";

const DEFAULT_CATEGORIES = [
  // EXPENSE
  {
    name: "Groceries",
    type: "EXPENSE" as const,
    icon: "cart-outline",
    color: "#F59E0B",
  },
  {
    name: "Dining",
    type: "EXPENSE" as const,
    icon: "restaurant-outline",
    color: "#EF4444",
  },
  {
    name: "Transport",
    type: "EXPENSE" as const,
    icon: "car-outline",
    color: "#6366F1",
  },
  {
    name: "Shopping",
    type: "EXPENSE" as const,
    icon: "bag-outline",
    color: "#EC4899",
  },
  {
    name: "Rent",
    type: "EXPENSE" as const,
    icon: "home-outline",
    color: "#8B5CF6",
  },
  {
    name: "Health",
    type: "EXPENSE" as const,
    icon: "medkit-outline",
    color: "#10B981",
  },
  {
    name: "Entertainment",
    type: "EXPENSE" as const,
    icon: "film-outline",
    color: "#F97316",
  },
  {
    name: "Bills",
    type: "EXPENSE" as const,
    icon: "flash-outline",
    color: "#EAB308",
  },
  {
    name: "Education",
    type: "EXPENSE" as const,
    icon: "book-outline",
    color: "#3B82F6",
  },
  {
    name: "Others",
    type: "EXPENSE" as const,
    icon: "pricetag-outline",
    color: "#6B7280",
  },
  // INCOME
  {
    name: "Salary",
    type: "INCOME" as const,
    icon: "briefcase-outline",
    color: "#10B981",
  },
  {
    name: "Freelance",
    type: "INCOME" as const,
    icon: "laptop-outline",
    color: "#6366F1",
  },
  {
    name: "Investment",
    type: "INCOME" as const,
    icon: "trending-up-outline",
    color: "#F59E0B",
  },
  {
    name: "Gift",
    type: "INCOME" as const,
    icon: "gift-outline",
    color: "#EC4899",
  },
  {
    name: "Other Income",
    type: "INCOME" as const,
    icon: "wallet-outline",
    color: "#6B7280",
  },
];

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });
  console.log(`Found ${users.length} user(s). Starting migration...\n`);

  for (const user of users) {
    // --- Categories ---
    const existingCategories = await prisma.category.count({
      where: { userId: user.id },
    });

    if (existingCategories === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId: user.id })),
      });
      console.log(
        `✓ [${user.email}] Created ${DEFAULT_CATEGORIES.length} default categories`,
      );
    } else {
      console.log(
        `- [${user.email}] Already has ${existingCategories} categories, skipping`,
      );
    }

    // --- Account ---
    const existingAccounts = await prisma.account.count({
      where: { userId: user.id },
    });

    if (existingAccounts === 0) {
      await prisma.account.create({
        data: {
          userId: user.id,
          name: "Main Account",
          type: "CHECKING",
          balance: 0,
          currency: "BRL",
        },
      });
      console.log(`✓ [${user.email}] Created default account`);
    } else {
      console.log(
        `- [${user.email}] Already has ${existingAccounts} account(s), skipping`,
      );
    }
  }

  console.log("\nMigration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
