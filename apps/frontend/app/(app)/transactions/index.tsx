import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import type { MonthlyTrendItem } from "@/services/analytics.service";
import { analyticsService } from "@/services/analytics.service";
import { budgetsService } from "@/services/budgets.service";
import { goalsService } from "@/services/goals.service";
import { formatCurrency } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, Path, Svg } from "react-native-svg";

// ─── Types & Constants ───────────────────────────────────────────────────────
type Period = "weekly" | "monthly" | "yearly";
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const CHART_COLORS = [
  "#2B3AF7",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
  "#F97316",
  "#14B8A6",
];

const ICON_MAP: Array<[string, IoniconName]> = [
  ["groceries", "cart-outline"],
  ["food", "restaurant-outline"],
  ["restaurant", "restaurant-outline"],
  ["dining", "restaurant-outline"],
  ["rent", "home-outline"],
  ["home", "home-outline"],
  ["salary", "briefcase-outline"],
  ["work", "briefcase-outline"],
  ["freelance", "laptop-outline"],
  ["shopping", "bag-outline"],
  ["transport", "car-outline"],
  ["car", "car-outline"],
  ["bus", "bus-outline"],
  ["health", "medkit-outline"],
  ["medical", "medkit-outline"],
  ["education", "book-outline"],
  ["entertainment", "film-outline"],
  ["bills", "flash-outline"],
  ["utilities", "flash-outline"],
  ["gift", "gift-outline"],
  ["savings", "wallet-outline"],
  ["investment", "trending-up-outline"],
  ["other", "pricetag-outline"],
];

function getCategoryIcon(name: string, icon: string): IoniconName {
  const key = (icon || name).toLowerCase();
  for (const [k, v] of ICON_MAP) if (key.includes(k)) return v;
  return "pricetag-outline";
}

// ─── Period Range Helpers ─────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");
const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const SHORT_MONTHS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
function fmtShort(d: Date) {
  return `${pad(d.getDate())} ${SHORT_MONTHS[d.getMonth()]}`;
}

function getPeriodRanges(period: Period) {
  const now = new Date();

  if (period === "weekly") {
    const day = now.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const prevMon = new Date(mon);
    prevMon.setDate(mon.getDate() - 7);
    const prevSun = new Date(prevMon);
    prevSun.setDate(prevMon.getDate() + 6);
    return {
      current: { startDate: fmtDate(mon), endDate: fmtDate(sun) },
      previous: { startDate: fmtDate(prevMon), endDate: fmtDate(prevSun) },
      budgetMonth: now.getMonth() + 1,
      budgetYear: now.getFullYear(),
      periodLabel: "semana passada",
      currentLabel: "esta semana",
      weekRangeLabel: `${fmtShort(mon)} — ${fmtShort(sun)}`,
      showBudgets: false,
    };
  }

  if (period === "monthly") {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    const prevDate = new Date(year, now.getMonth() - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth() + 1;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    return {
      current: {
        startDate: `${year}-${pad(month)}-01`,
        endDate: `${year}-${pad(month)}-${pad(lastDay)}`,
      },
      previous: {
        startDate: `${prevYear}-${pad(prevMonth)}-01`,
        endDate: `${prevYear}-${pad(prevMonth)}-${pad(prevLastDay)}`,
      },
      budgetMonth: month,
      budgetYear: year,
      periodLabel: "mês passado",
      currentLabel: "este mês",
      weekRangeLabel: null as string | null,
      showBudgets: true,
    };
  }

  // yearly
  const year = now.getFullYear();
  return {
    current: { startDate: `${year}-01-01`, endDate: `${year}-12-31` },
    previous: { startDate: `${year - 1}-01-01`, endDate: `${year - 1}-12-31` },
    budgetMonth: now.getMonth() + 1,
    budgetYear: year,
    periodLabel: "ano passado",
    currentLabel: `${year}`,
    weekRangeLabel: null as string | null,
    showBudgets: false,
  };
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({
  segments,
  total,
}: {
  segments: { value: number; color: string }[];
  total: number;
}) {
  const SIZE = 200;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 82;
  const innerR = 52;

  if (total === 0) {
    return (
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={cx}
          cy={cy}
          r={(R + innerR) / 2}
          fill="none"
          stroke={Colors.border}
          strokeWidth={R - innerR}
        />
      </Svg>
    );
  }

  let startAngle = -Math.PI / 2;
  const paths = segments.map(({ value, color }) => {
    const frac = value / total;
    const angle = frac >= 0.9999 ? 2 * Math.PI - 0.001 : frac * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    startAngle = endAngle;
    return { d, color };
  });

  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {paths.map((p, i) => (
        <Path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth={2} />
      ))}
    </Svg>
  );
}

// ─── Monthly Trend Chart ─────────────────────────────────────────────────────
const MONTH_LABELS = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];
const BAR_MAX_H = 84;

function MonthlyTrendChart({ data }: { data: MonthlyTrendItem[] }) {
  const maxVal = Math.max(1, ...data.flatMap((d) => [d.income, d.expenses]));
  return (
    <View style={styles.trendChart}>
      {MONTH_LABELS.map((label, i) => {
        const item = data[i] ?? {
          income: 0,
          expenses: 0,
          net: 0,
          month: i + 1,
        };
        const incomeH = Math.max(2, (item.income / maxVal) * BAR_MAX_H);
        const expH = Math.max(2, (item.expenses / maxVal) * BAR_MAX_H);
        return (
          <View key={i} style={styles.trendBarGroup}>
            <View style={styles.trendBars}>
              <View
                style={[
                  styles.trendBar,
                  { height: incomeH, backgroundColor: Colors.success },
                ]}
              />
              <View
                style={[
                  styles.trendBar,
                  { height: expH, backgroundColor: Colors.danger },
                ]}
              />
            </View>
            <Text style={styles.trendLabel}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ReportsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("monthly");
  const ranges = useMemo(() => getPeriodRanges(period), [period]);

  const { data: summary, isLoading } = useQuery({
    queryKey: [
      "analytics",
      "summary",
      ranges.current.startDate,
      ranges.previous.startDate,
    ],
    queryFn: () =>
      analyticsService.getSummary(
        ranges.current.startDate,
        ranges.current.endDate,
        ranges.previous.startDate,
        ranges.previous.endDate,
      ),
  });

  const { data: trend = [] } = useQuery({
    queryKey: ["analytics", "trend", new Date().getFullYear()],
    queryFn: () => analyticsService.getMonthlyTrend(new Date().getFullYear()),
    enabled: period === "yearly",
  });

  const { data: budgets = [], isLoading: loadingBudgets } = useQuery({
    queryKey: ["budgets", ranges.budgetMonth, ranges.budgetYear],
    queryFn: () => budgetsService.list(ranges.budgetMonth, ranges.budgetYear),
    enabled: ranges.showBudgets,
  });

  const { data: allGoals = [] } = useQuery({
    queryKey: ["goals"],
    queryFn: goalsService.list,
  });
  const activeGoals = allGoals.filter((g) => g.status === "ACTIVE");

  const totalSpent = summary?.current.totalExpenses ?? 0;
  const pctChange = summary?.pctChange ?? null;
  const categories = (summary?.current.categoryBreakdown ?? []).map(
    (cat, i) => ({
      ...cat,
      color: cat.categoryColor || CHART_COLORS[i % CHART_COLORS.length],
    }),
  );

  // ── Budget stats ─────────────────────────────────
  const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalBudgetSpent = budgets.reduce((s, b) => s + b.spent, 0);

  // ── Render ──────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spending Reports</Text>
      </View>

      {/* Period Tabs */}
      <View style={styles.periodTabs}>
        {(["weekly", "monthly", "yearly"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.periodTabLabel,
                period === p && styles.periodTabLabelActive,
              ]}
            >
              {p === "weekly"
                ? "Weekly"
                : p === "monthly"
                  ? "Monthly"
                  : "Yearly"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Summary Card ─────────────────────────── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {period === "yearly"
              ? `Resumo ${ranges.currentLabel}`
              : `Total Gasto: ${ranges.currentLabel}`}
          </Text>
          {ranges.weekRangeLabel ? (
            <Text style={styles.weekRangeLabel}>{ranges.weekRangeLabel}</Text>
          ) : null}
          {isLoading ? (
            <ActivityIndicator
              color={Colors.primary}
              style={{ marginVertical: 16 }}
            />
          ) : period === "yearly" && summary ? (
            <>
              <View style={styles.yearlyStats}>
                <View style={styles.yearlyStat}>
                  <Text style={styles.yearlyStatLabel}>Receitas</Text>
                  <Text
                    style={[styles.yearlyStatValue, { color: Colors.success }]}
                  >
                    {formatCurrency(summary.current.totalIncome)}
                  </Text>
                </View>
                <View style={styles.yearlyStatDivider} />
                <View style={styles.yearlyStat}>
                  <Text style={styles.yearlyStatLabel}>Despesas</Text>
                  <Text
                    style={[styles.yearlyStatValue, { color: Colors.danger }]}
                  >
                    {formatCurrency(totalSpent)}
                  </Text>
                </View>
                <View style={styles.yearlyStatDivider} />
                <View style={styles.yearlyStat}>
                  <Text style={styles.yearlyStatLabel}>Saldo</Text>
                  <Text
                    style={[
                      styles.yearlyStatValue,
                      {
                        color:
                          summary.current.net >= 0
                            ? Colors.success
                            : Colors.danger,
                      },
                    ]}
                  >
                    {formatCurrency(summary.current.net)}
                  </Text>
                </View>
              </View>
              {pctChange !== null ? (
                <View
                  style={[
                    styles.changeBadge,
                    {
                      backgroundColor:
                        pctChange > 0
                          ? Colors.dangerLight
                          : Colors.successLight,
                      marginTop: Spacing.sm,
                    },
                  ]}
                >
                  <Ionicons
                    name={pctChange > 0 ? "trending-up" : "trending-down"}
                    size={13}
                    color={pctChange > 0 ? Colors.danger : Colors.success}
                  />
                  <Text
                    style={[
                      styles.changeBadgeText,
                      { color: pctChange > 0 ? Colors.danger : Colors.success },
                    ]}
                  >
                    {pctChange > 0 ? "+" : ""}
                    {pctChange.toFixed(1)}% vs {ranges.periodLabel}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.summaryAmount}>
                {formatCurrency(totalSpent)}
              </Text>
              {pctChange !== null ? (
                <View
                  style={[
                    styles.changeBadge,
                    {
                      backgroundColor:
                        pctChange > 0
                          ? Colors.dangerLight
                          : Colors.successLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={pctChange > 0 ? "trending-up" : "trending-down"}
                    size={13}
                    color={pctChange > 0 ? Colors.danger : Colors.success}
                  />
                  <Text
                    style={[
                      styles.changeBadgeText,
                      {
                        color: pctChange > 0 ? Colors.danger : Colors.success,
                      },
                    ]}
                  >
                    {pctChange > 0 ? "+" : ""}
                    {pctChange.toFixed(1)}% vs {ranges.periodLabel}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.changeBadge,
                    { backgroundColor: Colors.gray100 },
                  ]}
                >
                  <Text
                    style={[
                      styles.changeBadgeText,
                      { color: Colors.textSecondary },
                    ]}
                  >
                    Primeiro período
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* ── Chart ─────────────────────────────────── */}
        {!isLoading && period === "yearly" ? (
          <View style={[styles.section, { marginBottom: Spacing.md }]}>
            <Text style={styles.sectionTitle}>Monthly Trend</Text>
            <MonthlyTrendChart data={trend} />
            <View style={styles.trendLegend}>
              <View style={styles.trendLegendItem}>
                <View
                  style={[styles.trendDot, { backgroundColor: Colors.success }]}
                />
                <Text style={styles.trendLegendLabel}>Income</Text>
              </View>
              <View style={styles.trendLegendItem}>
                <View
                  style={[styles.trendDot, { backgroundColor: Colors.danger }]}
                />
                <Text style={styles.trendLegendLabel}>Expenses</Text>
              </View>
            </View>
          </View>
        ) : !isLoading ? (
          <View style={styles.chartWrapper}>
            <DonutChart
              segments={categories.map((c) => ({
                value: c.total,
                color: c.color,
              }))}
              total={totalSpent}
            />
            <View style={styles.chartCenterOverlay} pointerEvents="none">
              <View style={styles.chartCenterCircle}>
                <Ionicons
                  name="wallet-outline"
                  size={24}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* ── Category Breakdown ────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>

          {isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : categories.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="receipt-outline"
                size={40}
                color={Colors.gray300}
              />
              <Text style={styles.emptyText}>
                Nenhuma despesa neste período
              </Text>
            </View>
          ) : (
            categories.map((cat, i) => (
              <View key={`${cat.categoryId}-${i}`} style={styles.catItem}>
                <View
                  style={[
                    styles.catIcon,
                    { backgroundColor: cat.color + "22" },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(cat.categoryName, cat.categoryIcon)}
                    size={18}
                    color={cat.color}
                  />
                </View>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{cat.categoryName}</Text>
                  <Text style={styles.catPct}>
                    {cat.pct.toFixed(0)}% of spending
                  </Text>
                </View>
                <Text style={styles.catAmount}>
                  {formatCurrency(cat.total)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* ── Budget Tracking ────────────────────────── */}
        {ranges.showBudgets && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Budget Tracking</Text>
              <TouchableOpacity
                onPress={() => router.push("/(app)/budgets" as never)}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Totals summary row */}
            {!loadingBudgets && budgets.length > 0 && (
              <View style={styles.budgetSummaryRow}>
                <Text style={styles.budgetSummaryText}>
                  {formatCurrency(totalBudgetSpent)} spent of{" "}
                  {formatCurrency(totalBudgeted)} total
                </Text>
                <View
                  style={[
                    styles.budgetSummaryBadge,
                    {
                      backgroundColor:
                        totalBudgetSpent > totalBudgeted
                          ? Colors.dangerLight
                          : Colors.successLight,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: Typography.fontSizes.xs,
                      fontWeight: Typography.fontWeights.semibold,
                      color:
                        totalBudgetSpent > totalBudgeted
                          ? Colors.danger
                          : Colors.success,
                    }}
                  >
                    {totalBudgeted > 0
                      ? `${((totalBudgetSpent / totalBudgeted) * 100).toFixed(0)}% usado`
                      : "—"}
                  </Text>
                </View>
              </View>
            )}

            {loadingBudgets ? (
              <ActivityIndicator color={Colors.primary} />
            ) : budgets.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="pie-chart-outline"
                  size={40}
                  color={Colors.gray300}
                />
                <Text style={styles.emptyText}>
                  Nenhum orçamento configurado
                </Text>
              </View>
            ) : (
              budgets.map((budget) => {
                const limit = parseFloat(budget.amount);
                const spent = budget.spent;
                const isOver = spent > limit;
                const pct =
                  limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                const barColor = isOver ? Colors.danger : Colors.primary;
                return (
                  <View key={budget.id} style={styles.budgetItem}>
                    <View style={styles.budgetItemHeader}>
                      <View style={styles.budgetItemLeft}>
                        <View
                          style={[
                            styles.budgetDot,
                            {
                              backgroundColor:
                                budget.category.color || Colors.primary,
                            },
                          ]}
                        />
                        <Text style={styles.budgetName}>
                          {budget.category.name}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.budgetAmounts,
                          isOver && { color: Colors.danger },
                        ]}
                      >
                        {formatCurrency(spent)} / {formatCurrency(limit)}
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${pct}%` as any,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                    {isOver && (
                      <Text style={styles.overBudgetText}>
                        Over budget by {formatCurrency(spent - limit)}
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── Goals Progress ─────────────────────────── */}
        {activeGoals.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Goals Progress</Text>
              <TouchableOpacity
                onPress={() => router.push("/(app)/goals" as never)}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {activeGoals.map((goal) => {
              const target = parseFloat(goal.targetAmount);
              const saved = parseFloat(goal.savedAmount);
              const pct =
                target > 0 ? Math.min((saved / target) * 100, 100) : 0;
              const remaining = Math.max(0, target - saved);
              const color = goal.color || Colors.primary;
              const icon = (goal.icon ||
                "trophy-outline") as React.ComponentProps<
                typeof Ionicons
              >["name"];
              return (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalItemHeader}>
                    <View style={styles.goalItemLeft}>
                      <View
                        style={[
                          styles.goalIconCircle,
                          { backgroundColor: color + "22" },
                        ]}
                      >
                        <Ionicons name={icon} size={16} color={color} />
                      </View>
                      <Text style={styles.goalName} numberOfLines={1}>
                        {goal.name}
                      </Text>
                    </View>
                    <Text style={[styles.goalPct, { color }]}>
                      {Math.round(pct)}%
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%` as any, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <View style={styles.goalAmountsRow}>
                    <Text style={styles.goalSaved}>
                      {formatCurrency(saved)} guardados
                    </Text>
                    <Text style={styles.goalRemaining}>
                      faltam {formatCurrency(remaining)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },

  periodTabs: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  periodTabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  periodTabLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
  },
  periodTabLabelActive: {
    color: Colors.white,
  },

  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
    ...cardShadow,
  },
  summaryLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  weekRangeLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: -4,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  // Yearly 3-stat row
  yearlyStats: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: Spacing.md,
  },
  yearlyStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  yearlyStatLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  yearlyStatValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  yearlyStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  changeBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },

  // Donut Chart
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  chartCenterOverlay: {
    position: "absolute",
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenterCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...cardShadow,
  },

  // Sections
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...cardShadow,
  },
  lastSection: { marginBottom: 0 },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },

  // Category items
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  catInfo: { flex: 1 },
  catName: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  catPct: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  catAmount: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },

  // Budget items
  budgetSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  budgetSummaryText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  budgetSummaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  budgetItem: {
    marginBottom: Spacing.md,
  },
  budgetItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  budgetItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  budgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  budgetName: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  budgetAmounts: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Radius.full,
  },
  overBudgetText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.danger,
    marginTop: 4,
    fontWeight: Typography.fontWeights.medium,
  },

  // ── Goal items ────────────────────────────────────────────────────────
  goalItem: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  goalItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  goalIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  goalName: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  goalPct: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  goalAmountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  goalSaved: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  goalRemaining: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },

  // Monthly Trend Chart
  trendChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 108,
    gap: 1,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  trendBarGroup: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  trendBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
    height: 84,
  },
  trendBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 2,
  },
  trendLabel: {
    fontSize: 8,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  trendLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  trendLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  trendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trendLegendLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },

  // Empty states
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
