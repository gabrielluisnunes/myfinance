import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import type { Budget } from "@/services/budgets.service";
import { budgetsService } from "@/services/budgets.service";
import { categoriesService } from "@/services/categories.service";
import { formatCurrency, formatMonth } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ───────────────────────────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// ─── Icon Helper ─────────────────────────────────────────────────────────────
const ICON_MAP: Array<[string, IoniconName]> = [
  ["food", "restaurant-outline"],
  ["restauran", "restaurant-outline"],
  ["dining", "restaurant-outline"],
  ["groceries", "cart-outline"],
  ["grocery", "cart-outline"],
  ["rent", "home-outline"],
  ["home", "home-outline"],
  ["housing", "home-outline"],
  ["salary", "briefcase-outline"],
  ["work", "briefcase-outline"],
  ["freelance", "laptop-outline"],
  ["shopping", "bag-outline"],
  ["transport", "car-outline"],
  ["car", "car-outline"],
  ["bus", "bus-outline"],
  ["transit", "bus-outline"],
  ["health", "medkit-outline"],
  ["medical", "medkit-outline"],
  ["education", "book-outline"],
  ["entertainment", "film-outline"],
  ["bills", "flash-outline"],
  ["utilities", "flash-outline"],
  ["gift", "gift-outline"],
  ["savings", "wallet-outline"],
  ["investment", "trending-up-outline"],
];

function getCategoryIcon(name: string, icon: string): IoniconName {
  const key = (icon || name).toLowerCase();
  for (const [k, v] of ICON_MAP) if (key.includes(k)) return v;
  return "pricetag-outline";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function centsToDisplay(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centsPart = cents % 100;
  return `R$ ${reais.toLocaleString("pt-BR")},${String(centsPart).padStart(2, "0")}`;
}

function barColor(pct: number): string {
  if (pct >= 100) return Colors.danger;
  if (pct >= 80) return Colors.warning;
  return Colors.success;
}

// ─── Budget Card ─────────────────────────────────────────────────────────────
function BudgetCard({
  budget,
  onEdit,
}: {
  budget: Budget;
  onEdit: (b: Budget) => void;
}) {
  const limit = parseFloat(budget.amount);
  const pct = limit > 0 ? Math.min((budget.spent / limit) * 100, 100) : 0;
  const isOver = budget.spent > limit;
  const color = budget.category.color || Colors.primary;
  const icon = getCategoryIcon(budget.category.name, budget.category.icon);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onEdit(budget)}
      activeOpacity={0.82}
    >
      <View style={styles.cardRow}>
        <View style={[styles.iconCircle, { backgroundColor: color + "22" }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardName}>{budget.category.name}</Text>
          <Text style={styles.cardSub}>
            {formatCurrency(budget.spent)} gastos
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardLimit}>{formatCurrency(limit)}</Text>
          <Text
            style={[
              styles.cardPct,
              { color: isOver ? Colors.danger : barColor(pct) },
            ]}
          >
            {isOver ? "Excedido" : `${Math.round(pct)}% gasto`}
          </Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%` as any, backgroundColor: barColor(pct) },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── Numpad ───────────────────────────────────────────────────────────────────
const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

function Numpad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <View style={styles.numpad}>
      {NUMPAD_KEYS.map((key, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.numKey, key === "" && styles.numKeyEmpty]}
          onPress={() => key !== "" && onKey(key)}
          disabled={key === ""}
          activeOpacity={0.65}
        >
          {key === "⌫" ? (
            <Ionicons
              name="backspace-outline"
              size={20}
              color={Colors.textPrimary}
            />
          ) : (
            <Text style={styles.numKeyText}>{key}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function BudgetsScreen() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [amountCents, setAmountCents] = useState(0);
  const [selectedCatId, setSelectedCatId] = useState("");
  const queryClient = useQueryClient();

  // ── Data ──────────────────────────────────────────────────────
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets", month, year],
    queryFn: () => budgetsService.list(month, year),
  });

  const { data: allCategories = [] } = useQuery({
    queryKey: ["categories", "EXPENSE"],
    queryFn: () => categoriesService.list("EXPENSE"),
  });

  const budgetedCatIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = allCategories.filter(
    (c) => !budgetedCatIds.has(c.id),
  );

  // ── Summary ───────────────────────────────────────────────────
  const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // ── Month Nav ─────────────────────────────────────────────────
  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  // ── Numpad handler ────────────────────────────────────────────
  function handleNumKey(key: string) {
    if (key === "⌫") {
      setAmountCents((prev) => Math.floor(prev / 10));
    } else {
      const digit = parseInt(key, 10);
      setAmountCents((prev) => prev * 10 + digit);
    }
  }

  // ── Mutations ─────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () =>
      budgetsService.create({
        categoryId: selectedCatId,
        month,
        year,
        amount: amountCents / 100,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setNewModalOpen(false);
      setAmountCents(0);
      setSelectedCatId("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => budgetsService.update(editBudget!.id, amountCents / 100),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setEditBudget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => budgetsService.delete(editBudget!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setEditBudget(null);
    },
  });

  function openNewModal() {
    setAmountCents(0);
    setSelectedCatId("");
    setNewModalOpen(true);
  }

  function openEditModal(budget: Budget) {
    setAmountCents(Math.round(parseFloat(budget.amount) * 100));
    setEditBudget(budget);
  }

  function confirmDelete() {
    Alert.alert(
      "Remover Orçamento",
      `Deseja remover o orçamento de ${editBudget?.category.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ],
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerCaption}>Monthly Overview</Text>
          <Text style={styles.headerTitle}>Budget Status</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={openNewModal}
          activeOpacity={0.82}
        >
          <Ionicons name="add" size={16} color={Colors.white} />
          <Text style={styles.newBtnText}>New Budget</Text>
        </TouchableOpacity>
      </View>

      {/* Month Nav */}
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthArrow}>
          <Ionicons
            name="chevron-back"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonth(month, year)}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.monthArrow}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { marginRight: Spacing.sm / 2 }]}>
            <View style={styles.summaryIconRow}>
              <View
                style={[
                  styles.summaryIconCircle,
                  { backgroundColor: Colors.primaryLight },
                ]}
              >
                <Ionicons
                  name="wallet-outline"
                  size={15}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.summaryCaption}>TOTAL BUDGETED</Text>
            </View>
            <Text style={styles.summaryAmount}>
              {formatCurrency(totalBudgeted)}
            </Text>
            <View style={styles.summaryBadge}>
              <Ionicons
                name="layers-outline"
                size={11}
                color={Colors.textSecondary}
              />
              <Text style={styles.summaryBadgeText}>
                {budgets.length} categoria{budgets.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryCard, { marginLeft: Spacing.sm / 2 }]}>
            <View style={styles.summaryIconRow}>
              <View
                style={[
                  styles.summaryIconCircle,
                  {
                    backgroundColor:
                      totalRemaining < 0
                        ? Colors.dangerLight
                        : Colors.successLight,
                  },
                ]}
              >
                <Ionicons
                  name="cash-outline"
                  size={15}
                  color={totalRemaining < 0 ? Colors.danger : Colors.success}
                />
              </View>
              <Text style={styles.summaryCaption}>REMAINING</Text>
            </View>
            <Text
              style={[
                styles.summaryAmount,
                totalRemaining < 0 && { color: Colors.danger },
              ]}
            >
              {formatCurrency(Math.abs(totalRemaining))}
            </Text>
            {totalBudgeted > 0 && (
              <View style={styles.summaryBadge}>
                <Ionicons
                  name={totalRemaining < 0 ? "trending-up" : "trending-down"}
                  size={11}
                  color={
                    totalRemaining < 0 ? Colors.danger : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.summaryBadgeText,
                    totalRemaining < 0 && { color: Colors.danger },
                  ]}
                >
                  {totalRemaining < 0 ? "+" : "-"}
                  {overallPct.toFixed(1)}% do limite
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Categories</Text>
          {budgets.length > 0 && (
            <Text style={styles.sectionCount}>{budgets.length} budgets</Text>
          )}
        </View>

        {/* Budget List */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : budgets.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="pie-chart-outline"
                size={40}
                color={Colors.gray300}
              />
            </View>
            <Text style={styles.emptyTitle}>Nenhum orçamento</Text>
            <Text style={styles.emptyText}>
              Crie orçamentos por categoria para controlar seus gastos mensais.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={openNewModal}
              activeOpacity={0.82}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.emptyBtnText}>Criar Orçamento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={openEditModal}
            />
          ))
        )}
      </ScrollView>

      {/* ── New Budget Modal ──────────────────────────────────────── */}
      <Modal
        visible={newModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setNewModalOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setNewModalOpen(false)}
        >
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Novo Orçamento</Text>
            <Text style={styles.sheetSubtitle}>{formatMonth(month, year)}</Text>

            {/* Category picker */}
            <Text style={styles.inputLabel}>Categoria</Text>
            {availableCategories.length === 0 ? (
              <View style={styles.allBudgeted}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={Colors.success}
                />
                <Text style={styles.allBudgetedText}>
                  Todas as categorias já têm orçamento neste período.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.catScroll}
                contentContainerStyle={styles.catScrollContent}
              >
                {availableCategories.map((cat) => {
                  const selected = selectedCatId === cat.id;
                  const color = cat.color || Colors.primary;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catChip,
                        selected && {
                          backgroundColor: color,
                          borderColor: color,
                        },
                      ]}
                      onPress={() => setSelectedCatId(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={getCategoryIcon(cat.name, cat.icon)}
                        size={13}
                        color={selected ? Colors.white : color}
                      />
                      <Text
                        style={[
                          styles.catChipText,
                          selected && { color: Colors.white },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Amount */}
            <Text style={styles.inputLabel}>Limite Mensal</Text>
            <View style={styles.amountBox}>
              <Text style={styles.amountText}>
                {centsToDisplay(amountCents)}
              </Text>
            </View>
            <Numpad onKey={handleNumKey} />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!selectedCatId || amountCents === 0) &&
                  styles.submitBtnDisabled,
              ]}
              onPress={() => createMutation.mutate()}
              disabled={
                !selectedCatId || amountCents === 0 || createMutation.isPending
              }
              activeOpacity={0.85}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Criar Orçamento</Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Edit Budget Modal ─────────────────────────────────────── */}
      <Modal
        visible={!!editBudget}
        animationType="slide"
        transparent
        onRequestClose={() => setEditBudget(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setEditBudget(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            {/* Edit header */}
            {editBudget && (
              <View style={styles.editHeader}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        (editBudget.category.color || Colors.primary) + "22",
                    },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(
                      editBudget.category.name,
                      editBudget.category.icon,
                    )}
                    size={22}
                    color={editBudget.category.color || Colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.sheetTitle}>
                    {editBudget.category.name}
                  </Text>
                  <Text style={styles.sheetSubtitle}>
                    {formatMonth(month, year)}
                  </Text>
                </View>
              </View>
            )}

            {/* Current status bar */}
            {editBudget &&
              (() => {
                const limit = parseFloat(editBudget.amount);
                const pct =
                  limit > 0
                    ? Math.min((editBudget.spent / limit) * 100, 100)
                    : 0;
                return (
                  <View style={styles.editStatus}>
                    <View style={styles.editStatusRow}>
                      <Text style={styles.editStatusLabel}>
                        {formatCurrency(editBudget.spent)} gastos
                      </Text>
                      <Text
                        style={[styles.editStatusPct, { color: barColor(pct) }]}
                      >
                        {pct.toFixed(0)}% utilizado
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${pct}%` as any,
                            backgroundColor: barColor(pct),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.editStatusSub}>
                      de {formatCurrency(parseFloat(editBudget.amount))} orçado
                    </Text>
                  </View>
                );
              })()}

            {/* New amount */}
            <Text style={styles.inputLabel}>Novo Limite Mensal</Text>
            <View style={styles.amountBox}>
              <Text style={styles.amountText}>
                {centsToDisplay(amountCents)}
              </Text>
            </View>
            <Numpad onKey={handleNumKey} />

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={confirmDelete}
                disabled={deleteMutation.isPending}
                activeOpacity={0.85}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator color={Colors.danger} />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      color={Colors.danger}
                    />
                    <Text style={styles.deleteBtnText}>Remover</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { flex: 1 },
                  amountCents === 0 && styles.submitBtnDisabled,
                ]}
                onPress={() => updateMutation.mutate()}
                disabled={amountCents === 0 || updateMutation.isPending}
                activeOpacity={0.85}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerCaption: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  newBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
  },

  // Month Nav
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  monthArrow: {
    padding: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    textTransform: "capitalize",
  },

  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Summary cards
  summaryRow: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...cardShadow,
  },
  summaryIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  summaryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCaption: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  summaryBadgeText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },

  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },

  // Budget Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...cardShadow,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMeta: { flex: 1 },
  cardName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  cardRight: { alignItems: "flex-end" },
  cardLimit: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardPct: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Radius.full,
  },

  // Empty state
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
  },
  emptyBtnText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray200,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: "capitalize",
  },

  inputLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // Category chips
  catScroll: { marginBottom: Spacing.sm },
  catScrollContent: { gap: Spacing.sm, paddingVertical: 2 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  catChipText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },

  allBudgeted: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  allBudgetedText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },

  // Amount display
  amountBox: {
    backgroundColor: Colors.gray100,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  amountText: {
    fontSize: 28,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },

  // Numpad
  numpad: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.md,
  },
  numKey: {
    width: "33.33%",
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  numKeyEmpty: { opacity: 0 },
  numKeyText: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },

  // Submit / actions
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    backgroundColor: Colors.gray200,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
  },

  // Edit modal
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  editStatus: {
    backgroundColor: Colors.gray100,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  editStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editStatusLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  editStatusPct: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  editStatusSub: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  editActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.dangerLight,
    backgroundColor: Colors.dangerLight,
  },
  deleteBtnText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.danger,
  },
});
