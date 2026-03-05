import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { transactionsService } from "@/services/transactions.service";
import { formatCurrency, formatShortDate } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => transactionsService.list({ page: 1, limit: 50 }),
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transações</Text>
      </View>
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isLoading ? "Carregando..." : "Nenhuma transação"}
            </Text>
          </View>
        }
        renderItem={({ item: tx }) => (
          <View style={styles.item}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    tx.type === "INCOME" ? Colors.income : Colors.expense,
                },
              ]}
            />
            <View style={styles.info}>
              <Text style={styles.description}>{tx.description}</Text>
              <Text style={styles.meta}>
                {tx.category.name} · {formatShortDate(tx.date)}
              </Text>
            </View>
            <View style={styles.right}>
              <Text
                style={[
                  styles.amount,
                  {
                    color:
                      tx.type === "INCOME" ? Colors.income : Colors.expense,
                  },
                ]}
              >
                {tx.type === "INCOME" ? "+" : "-"}
                {formatCurrency(parseFloat(tx.amount))}
              </Text>
              <Text style={styles.status}>
                {tx.status === "CONFIRMED" ? "✓" : "⏳"}
              </Text>
            </View>
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
  list: { padding: Spacing.lg, paddingTop: 0, paddingBottom: Spacing.xxl },
  empty: { alignItems: "center", padding: Spacing.xxl },
  emptyText: { fontSize: Typography.fontSizes.md, color: Colors.textSecondary },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.md },
  info: { flex: 1 },
  description: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: { alignItems: "flex-end" },
  amount: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },
  status: { fontSize: Typography.fontSizes.xs, marginTop: 2 },
});
