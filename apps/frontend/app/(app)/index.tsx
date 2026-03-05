import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { accountsService } from "@/services/accounts.service";
import { transactionsService } from "@/services/transactions.service";
import { useAuthStore } from "@/stores/auth.store";
import { formatCurrency } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { user } = useAuthStore();

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountsService.list(),
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions", { page: 1, limit: 5 }],
    queryFn: () => transactionsService.list({ page: 1, limit: 5 }),
  });

  const totalBalance =
    accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance), 0) ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, {user?.name?.split(" ")[0]} 👋
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo total</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(totalBalance)}
          </Text>
          <Text style={styles.balanceAccounts}>
            {accounts?.length ?? 0}{" "}
            {(accounts?.length ?? 0) === 1 ? "conta" : "contas"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas transações</Text>
          {transactions?.data.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
            </View>
          )}
          {transactions?.data.map((tx) => (
            <View key={tx.id} style={styles.txItem}>
              <View
                style={[
                  styles.txDot,
                  {
                    backgroundColor:
                      tx.type === "INCOME" ? Colors.income : Colors.expense,
                  },
                ]}
              />
              <View style={styles.txInfo}>
                <Text style={styles.txDescription}>{tx.description}</Text>
                <Text style={styles.txCategory}>{tx.category.name}</Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  {
                    color:
                      tx.type === "INCOME" ? Colors.income : Colors.expense,
                  },
                ]}
              >
                {tx.type === "INCOME" ? "+" : "-"}
                {formatCurrency(parseFloat(tx.amount))}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  greeting: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  date: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: Typography.fontSizes.sm,
    color: "rgba(255,255,255,0.8)",
    marginBottom: Spacing.xs,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.white,
  },
  balanceAccounts: {
    fontSize: Typography.fontSizes.xs,
    color: "rgba(255,255,255,0.7)",
    marginTop: Spacing.xs,
  },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  empty: { alignItems: "center", padding: Spacing.xl },
  emptyText: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  txDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.md },
  txInfo: { flex: 1 },
  txDescription: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  txCategory: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  txAmount: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
});
