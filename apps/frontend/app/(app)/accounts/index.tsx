import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { accountsService } from "@/services/accounts.service";
import { formatCurrency } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: "Conta Corrente",
  SAVINGS: "Poupança",
  INVESTMENT: "Investimento",
  WALLET: "Carteira",
};

export default function AccountsScreen() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountsService.list(),
  });

  const totalBalance =
    accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance), 0) ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contas</Text>
        <Text style={styles.total}>{formatCurrency(totalBalance)}</Text>
        <Text style={styles.totalLabel}>Saldo total</Text>
      </View>
      <FlatList
        data={accounts ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isLoading ? "Carregando..." : "Nenhuma conta cadastrada"}
            </Text>
          </View>
        }
        renderItem={({ item: acc }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.accountName}>{acc.name}</Text>
              <Text style={styles.accountType}>
                {ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}
              </Text>
            </View>
            <Text style={styles.balance}>
              {formatCurrency(parseFloat(acc.balance))}
            </Text>
            <Text style={styles.currency}>{acc.currency}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, paddingBottom: Spacing.md },
  title: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  total: {
    fontSize: 36,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  empty: { alignItems: "center", padding: Spacing.xxl },
  emptyText: { fontSize: Typography.fontSizes.md, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  accountName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  accountType: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    backgroundColor: Colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  balance: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  currency: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
