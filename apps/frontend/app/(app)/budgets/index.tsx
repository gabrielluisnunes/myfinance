import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { budgetsService } from "@/services/budgets.service";
import { formatCurrency, formatMonth } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BudgetsScreen() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets", month, year],
    queryFn: () => budgetsService.list(month, year),
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orçamento</Text>
        <Text style={styles.period}>{formatMonth(month, year)}</Text>
      </View>
      <FlatList
        data={budgets ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isLoading ? "Carregando..." : "Nenhum orçamento cadastrado"}
            </Text>
          </View>
        }
        renderItem={({ item: budget }) => {
          const percentage = Math.min(
            (budget.spent / parseFloat(budget.amount)) * 100,
            100,
          );
          const isOver = budget.spent > parseFloat(budget.amount);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: budget.category.color },
                  ]}
                />
                <Text style={styles.categoryName}>{budget.category.name}</Text>
                <Text
                  style={[
                    styles.percentage,
                    { color: isOver ? Colors.danger : Colors.textSecondary },
                  ]}
                >
                  {Math.round(percentage)}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${percentage}%` as any,
                      backgroundColor: isOver ? Colors.danger : Colors.primary,
                    },
                  ]}
                />
              </View>
              <View style={styles.amounts}>
                <Text style={styles.spent}>
                  {formatCurrency(budget.spent)} gastos
                </Text>
                <Text style={styles.limit}>
                  de {formatCurrency(parseFloat(budget.amount))}
                </Text>
              </View>
            </View>
          );
        }}
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
  period: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: "capitalize",
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
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  categoryName: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  percentage: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.gray100,
    borderRadius: Radius.full,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressBar: { height: "100%", borderRadius: Radius.full },
  amounts: { flexDirection: "row", justifyContent: "space-between" },
  spent: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  limit: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary },
});
