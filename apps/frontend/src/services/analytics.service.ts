import { api } from "./api";

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

export interface AnalyticsSummary {
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

export const analyticsService = {
  async getSummary(
    startDate: string,
    endDate: string,
    prevStartDate: string,
    prevEndDate: string,
  ): Promise<AnalyticsSummary> {
    const { data } = await api.get<{ data: AnalyticsSummary }>(
      "/analytics/summary",
      { params: { startDate, endDate, prevStartDate, prevEndDate } },
    );
    return data.data;
  },

  async getMonthlyTrend(year: number): Promise<MonthlyTrendItem[]> {
    const { data } = await api.get<{ data: MonthlyTrendItem[] }>(
      "/analytics/monthly-trend",
      { params: { year } },
    );
    return data.data;
  },
};
