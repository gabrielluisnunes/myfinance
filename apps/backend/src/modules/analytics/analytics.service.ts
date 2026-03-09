import { prisma } from "@myfinance/db";

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  pct: number;
}

export interface PeriodSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  categoryBreakdown: CategoryBreakdownItem[];
}

export interface AnalyticsSummaryResult {
  current: PeriodSummary;
  previous: {
    totalIncome: number;
    totalExpenses: number;
    net: number;
  };
  pctChange: number | null;
}

export interface MonthlyTrendItem {
  month: number;
  income: number;
  expenses: number;
  net: number;
}

function toLocalMidnight(dateStr: string, end = false): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (end) {
    // End of day on local date → use next day midnight UTC offset to cover full day
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

async function getPeriodSummary(
  userId: string,
  range: DateRange,
): Promise<PeriodSummary> {
  const gte = toLocalMidnight(range.startDate, false);
  const lte = toLocalMidnight(range.endDate, true);

  // Aggregate income and expenses by type
  const typeTotals = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId,
      status: "CONFIRMED",
      date: { gte, lte },
    },
    _sum: { amount: true },
  });

  const totalIncome = Number(
    typeTotals.find((r) => r.type === "INCOME")?._sum?.amount ?? 0,
  );
  const totalExpenses = Number(
    typeTotals.find((r) => r.type === "EXPENSE")?._sum?.amount ?? 0,
  );

  // Aggregate expenses by category
  const catGroups = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      status: "CONFIRMED",
      date: { gte, lte },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  // Fetch category details in bulk
  const categoryIds = catGroups.map((g) => g.categoryId);
  const categories =
    categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, color: true, icon: true },
        })
      : [];

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const categoryBreakdown: CategoryBreakdownItem[] = catGroups.map((g) => {
    const cat = catMap.get(g.categoryId);
    const total = Number(g._sum?.amount ?? 0);
    return {
      categoryId: g.categoryId,
      categoryName: cat?.name ?? "Unknown",
      categoryColor: cat?.color ?? "#9BA5B7",
      categoryIcon: cat?.icon ?? "",
      total,
      pct: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
    };
  });

  return {
    totalIncome,
    totalExpenses,
    net: totalIncome - totalExpenses,
    categoryBreakdown,
  };
}

export async function getAnalyticsSummary(
  userId: string,
  current: DateRange,
  previous: DateRange,
): Promise<AnalyticsSummaryResult> {
  const [cur, prev] = await Promise.all([
    getPeriodSummary(userId, current),
    getPeriodSummary(userId, previous),
  ]);

  const pctChange =
    prev.totalExpenses > 0
      ? ((cur.totalExpenses - prev.totalExpenses) / prev.totalExpenses) * 100
      : null;

  return {
    current: cur,
    previous: {
      totalIncome: prev.totalIncome,
      totalExpenses: prev.totalExpenses,
      net: prev.net,
    },
    pctChange,
  };
}

export async function getMonthlyTrend(
  userId: string,
  year: number,
): Promise<MonthlyTrendItem[]> {
  const gte = new Date(year, 0, 1, 0, 0, 0);
  const lte = new Date(year, 11, 31, 23, 59, 59, 999);

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      status: "CONFIRMED",
      date: { gte, lte },
    },
    select: { type: true, amount: true, date: true },
  });

  const monthMap = new Map<number, { income: number; expenses: number }>();
  for (let m = 1; m <= 12; m++) {
    monthMap.set(m, { income: 0, expenses: 0 });
  }

  for (const row of rows) {
    const m = row.date.getMonth() + 1;
    const entry = monthMap.get(m)!;
    const amt = Number(row.amount);
    if (row.type === "INCOME") entry.income += amt;
    else entry.expenses += amt;
  }

  return Array.from(monthMap.entries()).map(
    ([month, { income, expenses }]) => ({
      month,
      income,
      expenses,
      net: income - expenses,
    }),
  );
}
