import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { accountsService } from "@/services/accounts.service";
import { categoriesService } from "@/services/categories.service";
import { transactionsService } from "@/services/transactions.service";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TransactionType = "INCOME" | "EXPENSE";
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

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
  ["transfer", "swap-horizontal-outline"],
  ["savings", "wallet-outline"],
  ["investment", "trending-up-outline"],
  ["income", "trending-up-outline"],
  ["other", "pricetag-outline"],
];

function getCategoryIcon(name: string, icon: string): IoniconName {
  const key = (icon || name).toLowerCase();
  for (const [k, v] of ICON_MAP) {
    if (key.includes(k)) return v;
  }
  return "pricetag-outline";
}

export default function NewTransactionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { type: initialType } = useLocalSearchParams<{ type?: string }>();

  const [txType, setTxType] = useState<TransactionType>(
    initialType === "INCOME" ? "INCOME" : "EXPENSE",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // Re-sync type whenever the route param changes (screen may be cached)
  useEffect(() => {
    if (initialType === "INCOME" || initialType === "EXPENSE") {
      setTxType(initialType);
      setSelectedCategoryId(null);
    }
  }, [initialType]);

  // Reset entire form every time the screen gains focus so stale values never show
  useFocusEffect(
    useCallback(() => {
      setAmountCents(0);
      setDate(new Date());
      setDescription("");
      setErrorMsg(null);
      setSelectedCategoryId(null);
    }, []),
  );

  // cents-based amount: 100 = R$ 1,00
  const [amountCents, setAmountCents] = useState(0);

  function formatCents(cents: number): string {
    return (cents / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function handleAmountChange(raw: string) {
    const digits = raw.replace(/\D/g, "");
    setAmountCents(digits === "" ? 0 : parseInt(digits, 10));
  }
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  function dateToISO(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function dateToDisplay(d: Date): string {
    return d.toLocaleDateString("pt-BR");
  }

  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", txType],
    queryFn: () => categoriesService.list(txType),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsService.list,
    select: (list) => list.filter((a) => a.isActive),
  });

  const defaultAccount = accounts[0];

  function handleTypeChange(type: TransactionType) {
    setTxType(type);
    setSelectedCategoryId(null);
  }

  async function handleSave() {
    setErrorMsg(null);
    const amount = amountCents / 100;
    if (!amount || amount <= 0) {
      setErrorMsg("Informe um valor maior que zero.");
      return;
    }
    if (!selectedCategoryId) {
      setErrorMsg("Selecione uma categoria para continuar.");
      return;
    }
    if (!defaultAccount) {
      setErrorMsg("Nenhuma conta encontrada. Crie uma conta primeiro.");
      return;
    }

    setSaving(true);
    try {
      await transactionsService.create({
        accountId: defaultAccount.id,
        categoryId: selectedCategoryId,
        type: txType,
        amount,
        description:
          description.trim() || (txType === "INCOME" ? "Receita" : "Despesa"),
        date: dateToISO(date),
        status: "CONFIRMED",
      });
      await queryClient.refetchQueries({ queryKey: ["transactions"] });
      await queryClient.refetchQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      router.back();
    } catch {
      setErrorMsg("Não foi possível salvar a transação. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Transação</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Error Banner */}
      {errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={Colors.danger}
          />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
          <TouchableOpacity onPress={() => setErrorMsg(null)}>
            <Ionicons name="close" size={16} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      )}

      {/* Type Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, txType === "EXPENSE" && styles.tabActive]}
          onPress={() => handleTypeChange("EXPENSE")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabLabel,
              txType === "EXPENSE" && styles.tabLabelActive,
            ]}
          >
            Despesa
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, txType === "INCOME" && styles.tabActive]}
          onPress={() => handleTypeChange("INCOME")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabLabel,
              txType === "INCOME" && styles.tabLabelActive,
            ]}
          >
            Receita
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Amount */}
        <View
          style={[
            styles.amountCard,
            {
              backgroundColor:
                txType === "INCOME" ? Colors.successLight : Colors.dangerLight,
              borderColor: txType === "INCOME" ? Colors.success : Colors.danger,
            },
          ]}
        >
          <Text
            style={[
              styles.amountLabel,
              {
                color: txType === "INCOME" ? Colors.success : Colors.danger,
              },
            ]}
          >
            {txType === "INCOME" ? "↑ VALOR DA RECEITA" : "↓ VALOR DA DESPESA"}
          </Text>
          <View style={styles.amountRow}>
            <Text
              style={[
                styles.amountCurrency,
                {
                  color: txType === "INCOME" ? Colors.success : Colors.danger,
                },
              ]}
            >
              R$
            </Text>
            <TextInput
              style={[
                styles.amountInput,
                { color: txType === "INCOME" ? Colors.success : Colors.danger },
                Platform.OS === "web" && ({ outlineStyle: "none" } as any),
              ]}
              value={formatCents(amountCents)}
              onChangeText={handleAmountChange}
              keyboardType="number-pad"
              selectTextOnFocus
              placeholder="0,00"
              placeholderTextColor={
                txType === "INCOME"
                  ? `${Colors.success}66`
                  : `${Colors.danger}66`
              }
            />
          </View>
          <Text style={styles.amountHint}>Toque para editar o valor</Text>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Selecionar Categoria</Text>
        {loadingCategories ? (
          <ActivityIndicator
            color={Colors.primary}
            style={{ marginVertical: 24 }}
          />
        ) : categories.length === 0 ? (
          <View style={styles.emptyCategories}>
            <Ionicons
              name="folder-open-outline"
              size={32}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyCategoriesText}>
              Nenhuma categoria. Adicione nas Configurações.
            </Text>
          </View>
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={getCategoryIcon(cat.name, cat.icon)}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryName,
                      isSelected && styles.categoryNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Date */}
        <Text style={styles.sectionTitle}>Data</Text>
        {Platform.OS === "web" ? (
          <View style={styles.fieldRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={Colors.textSecondary}
            />
            {/* @ts-ignore */}
            <input
              type="date"
              value={dateToISO(date)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDate(new Date(e.target.value + "T12:00:00"))
              }
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 14,
                color: Colors.textPrimary,
                backgroundColor: "transparent",
                marginLeft: 10,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            />
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.fieldRow}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={[styles.fieldInput, { lineHeight: 20 }]}>
                {dateToDisplay(date)}
              </Text>
              <Ionicons
                name="chevron-down-outline"
                size={16}
                color={Colors.gray400}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(_event, selected) => {
                  setShowDatePicker(false);
                  if (selected) setDate(selected);
                }}
              />
            )}
          </>
        )}

        {/* Description */}
        <Text style={styles.sectionTitle}>Descrição</Text>
        <View style={styles.fieldRow}>
          <Ionicons
            name="reorder-three-outline"
            size={20}
            color={Colors.textSecondary}
          />
          <TextInput
            style={styles.fieldInput}
            placeholder="Para que foi isso?"
            placeholderTextColor={Colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            returnKeyType="done"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Salvar Transação</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.danger,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 24,
  },
  amountCard: {
    marginTop: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    overflow: "hidden",
  },
  amountHint: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 6,
    opacity: 0.7,
  },
  amountLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 4,
  },
  amountCurrency: {
    fontSize: 28,
    fontWeight: Typography.fontWeights.bold,
    flexShrink: 0,
  },
  amountInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: Typography.fontWeights.bold,
    padding: 0,
  } as any,
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: "47%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
  },
  categoryCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryName: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  categoryNameSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },
  emptyCategories: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyCategoriesText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    padding: 0,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
