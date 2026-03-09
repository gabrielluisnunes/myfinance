import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { useSidebar } from "@/contexts/sidebar.context";
import { accountsService } from "@/services/accounts.service";
import {
  transactionsService,
  type Transaction,
} from "@/services/transactions.service";
import { formatCurrency } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function getMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  const startDate = `${year}-${pad(month)}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const endDate = `${year}-${pad(month)}-${pad(daysInMonth)}`;
  return { startDate, endDate, year, month };
}

function formatTxDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const txDay = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (today.getTime() - txDay.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return txDay.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCategoryIcon(category: Transaction["category"]): IoniconName {
  const key = (category.icon || category.name).toLowerCase();
  if (key.includes("food") || key.includes("restaurant"))
    return "restaurant-outline";
  if (key.includes("transport") || key.includes("bus")) return "bus-outline";
  if (key.includes("entertain") || key.includes("netflix"))
    return "film-outline";
  if (key.includes("health") || key.includes("medical"))
    return "medkit-outline";
  if (key.includes("shopping")) return "bag-outline";
  if (key.includes("salary") || key.includes("income"))
    return "briefcase-outline";
  if (key.includes("bill") || key.includes("util")) return "flash-outline";
  if (key.includes("education")) return "book-outline";
  if (key.includes("transfer")) return "swap-horizontal-outline";
  return "receipt-outline";
}

export default function DashboardScreen() {
  const { toggle } = useSidebar();
  const router = useRouter();
  const { startDate, endDate, year, month } = getMonthRange();

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsService.list,
  });

  const { data: monthlyTxs } = useQuery({
    queryKey: ["transactions", "monthly", year, month],
    queryFn: () => transactionsService.list({ startDate, endDate, limit: 500 }),
  });

  const { data: recentTxs } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () => transactionsService.list({ page: 1, limit: 5 }),
  });

  const totalBalance =
    accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance), 0) ?? 0;

  const monthlyIncome =
    monthlyTxs?.data
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0) ?? 0;

  const monthlyExpenses =
    monthlyTxs?.data
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0) ?? 0;

  const monthlyNet = monthlyIncome - monthlyExpenses;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={toggle}>
          <Ionicons name="menu" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(totalBalance)}
          </Text>
          <View
            style={[
              styles.balanceBadge,
              {
                backgroundColor:
                  monthlyNet >= 0 ? Colors.successLight : Colors.dangerLight,
              },
            ]}
          >
            <Ionicons
              name={monthlyNet >= 0 ? "trending-up" : "trending-down"}
              size={12}
              color={monthlyNet >= 0 ? Colors.success : Colors.danger}
            />
            <Text
              style={[
                styles.balanceBadgeText,
                { color: monthlyNet >= 0 ? Colors.success : Colors.danger },
              ]}
            >
              {monthlyNet >= 0 ? "+" : ""}
              {formatCurrency(Math.abs(monthlyNet))} this month
            </Text>
          </View>
        </View>

        {/* Monthly Income / Expenses */}
        <View style={styles.monthlyRow}>
          <View style={styles.monthlyCard}>
            <View
              style={[
                styles.monthlyIcon,
                { backgroundColor: Colors.successLight },
              ]}
            >
              <Ionicons name="arrow-up" size={18} color={Colors.success} />
            </View>
            <Text style={styles.monthlyCardLabel}>Monthly Income</Text>
            <Text style={[styles.monthlyCardAmount, { color: Colors.success }]}>
              {formatCurrency(monthlyIncome)}
            </Text>
          </View>
          <View style={styles.monthlyCard}>
            <View
              style={[
                styles.monthlyIcon,
                { backgroundColor: Colors.dangerLight },
              ]}
            >
              <Ionicons name="arrow-down" size={18} color={Colors.danger} />
            </View>
            <Text style={styles.monthlyCardLabel}>Monthly Expenses</Text>
            <Text style={[styles.monthlyCardAmount, { color: Colors.danger }]}>
              {formatCurrency(monthlyExpenses)}
            </Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => router.push("/transactions" as never)}
            >
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>

          {!recentTxs?.data || recentTxs.data.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="receipt-outline"
                size={40}
                color={Colors.gray300}
              />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            recentTxs.data.map((tx) => {
              const bgColor = tx.category.color
                ? tx.category.color + "22"
                : Colors.gray100;
              const iconColor = tx.category.color || Colors.primary;
              return (
                <View key={tx.id} style={styles.txItem}>
                  <View
                    style={[styles.txIconCircle, { backgroundColor: bgColor }]}
                  >
                    <Ionicons
                      name={getCategoryIcon(tx.category)}
                      size={18}
                      color={iconColor}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text style={styles.txDate}>{formatTxDate(tx.date)}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text
                      style={[
                        styles.txAmount,
                        {
                          color:
                            tx.type === "INCOME"
                              ? Colors.success
                              : Colors.danger,
                        },
                      ]}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(parseFloat(tx.amount))}
                    </Text>
                    <Text style={styles.txCategory}>
                      {tx.category.name.toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push("/(app)/transaction/new")}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
    paddingTop: Spacing.sm,
  },
  balanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
    ...cardShadow,
  },
  balanceLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  balanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  balanceBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  monthlyRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  monthlyCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...cardShadow,
  },
  monthlyIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  monthlyCardLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  monthlyCardAmount: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...cardShadow,
  },
  txIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  txInfo: { flex: 1 },
  txTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  txDate: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  txRight: { alignItems: "flex-end" },
  txAmount: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 3,
  },
  txCategory: {
    fontSize: 9,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  fab: {
    position: "absolute",
    bottom: 78,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
