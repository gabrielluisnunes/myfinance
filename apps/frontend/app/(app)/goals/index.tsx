import { Colors, Radius, Spacing } from "@/constants/theme";
import type { Goal } from "@/services/goals.service";
import { goalsService } from "@/services/goals.service";
import { formatCurrency } from "@/utils/format";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// ─── Constants ────────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  "#2B3AF7",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#14B8A6",
  "#6366F1",
];

const PRESET_ICONS: IoniconName[] = [
  "trophy-outline",
  "home-outline",
  "car-outline",
  "airplane-outline",
  "school-outline",
  "heart-outline",
  "diamond-outline",
  "gift-outline",
  "fitness-outline",
  "musical-notes-outline",
  "camera-outline",
  "book-outline",
  "globe-outline",
  "bicycle-outline",
  "medical-outline",
  "restaurant-outline",
  "wallet-outline",
  "star-outline",
];

const NUMPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function centsToDisplay(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centsPart = cents % 100;
  return `R$ ${reais.toLocaleString("pt-BR")},${String(centsPart).padStart(2, "0")}`;
}

function barColor(pct: number): string {
  if (pct >= 100) return Colors.success;
  if (pct >= 60) return Colors.primary;
  return Colors.warning;
}

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

// ─── Date helpers ───────────────────────────────────────────────────────────────
function maskDate(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function displayDateToISO(display: string): string | null {
  const parts = display.split("/");
  if (parts.length !== 3 || parts[2].length !== 4) return null;
  const [dd, mm, yyyy] = parts;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function isoToDisplayDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ─── Numpad ───────────────────────────────────────────────────────────────────
function Numpad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <View style={styles.numpad}>
      {NUMPAD_ROWS.map((row, ri) => (
        <View key={ri} style={styles.numpadRow}>
          {row.map((key, ki) =>
            key === "" ? (
              <View key={ki} style={styles.numKeyBlank} />
            ) : (
              <TouchableOpacity
                key={ki}
                style={[styles.numKey, key === "⌫" && styles.numKeyDelete]}
                onPress={() => onKey(key)}
                activeOpacity={0.6}
              >
                {key === "⌫" ? (
                  <Ionicons
                    name="backspace-outline"
                    size={22}
                    color={Colors.textSecondary}
                  />
                ) : (
                  <Text style={styles.numKeyText}>{key}</Text>
                )}
              </TouchableOpacity>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({
  goal,
  onDeposit,
  onEdit,
}: {
  goal: Goal;
  onDeposit: (g: Goal) => void;
  onEdit: (g: Goal) => void;
}) {
  const target = parseFloat(goal.targetAmount);
  const saved = parseFloat(goal.savedAmount);
  const remaining = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const color = goal.color || Colors.primary;
  const icon = (goal.icon as IoniconName) || "trophy-outline";
  const deadline = formatDeadline(goal.deadline);
  const isCompleted = goal.status === "COMPLETED";

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      {/* ─ Top row: icon + info + edit icon */}
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: color + "22" }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {goal.name}
            </Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={Colors.success}
                />
                <Text style={styles.completedBadgeText}>Concluída</Text>
              </View>
            )}
          </View>
          {deadline && (
            <Text style={styles.cardDeadline}>⏰ Prazo: {deadline}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.cardEditBtn}
          onPress={() => onEdit(goal)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* ─ Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%` as any, backgroundColor: color },
          ]}
        />
      </View>

      {/* ─ Amounts */}
      <View style={styles.cardAmounts}>
        <Text style={styles.cardSaved}>{formatCurrency(saved)} guardados</Text>
        <Text style={[styles.cardPct, { color }]}>{Math.round(pct)}%</Text>
        <Text style={styles.cardTarget}>de {formatCurrency(target)}</Text>
      </View>

      {/* ─ Deposit button */}
      {!isCompleted && (
        <TouchableOpacity
          style={[
            styles.depositBtn,
            { borderColor: color + "55", backgroundColor: color + "11" },
          ]}
          onPress={() => onDeposit(goal)}
          activeOpacity={0.75}
        >
          <Ionicons name="add-circle-outline" size={16} color={color} />
          <Text style={[styles.depositBtnText, { color }]}>
            Adicionar valor · faltam {formatCurrency(remaining)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GoalsScreen() {
  const queryClient = useQueryClient();

  // ── Modal state ──────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);

  // ── Create / Edit form state ──────────────────────────────────────────
  const [name, setName] = useState("");
  const [targetCents, setTargetCents] = useState(0);
  const [savedCents, setSavedCents] = useState(0);
  const [selectedIcon, setSelectedIcon] =
    useState<IoniconName>("trophy-outline");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [deadlineText, setDeadlineText] = useState("");

  // ── Deposit state ─────────────────────────────────────────────────────
  const [depositCents, setDepositCents] = useState(0);

  // ── Data ──────────────────────────────────────────────────────────────
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => goalsService.list(),
  });

  // ── Derived ───────────────────────────────────────────────────────────
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const totalSaved = goals.reduce((s, g) => s + parseFloat(g.savedAmount), 0);

  // ── Mutations ─────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () =>
      goalsService.create({
        name: name.trim(),
        targetAmount: targetCents / 100,
        savedAmount: savedCents / 100,
        icon: selectedIcon,
        color: selectedColor,
        deadline: displayDateToISO(deadlineText),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      goalsService.update(editGoal!.id, {
        name: name.trim(),
        targetAmount: targetCents / 100,
        icon: selectedIcon,
        color: selectedColor,
        deadline: displayDateToISO(deadlineText),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setEditGoal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => goalsService.delete(editGoal!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setEditGoal(null);
    },
  });

  const depositMutation = useMutation({
    mutationFn: () => goalsService.deposit(depositGoal!.id, depositCents / 100),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setDepositGoal(null);
      setDepositCents(0);
    },
  });

  // ── Helpers ───────────────────────────────────────────────────────────
  function resetForm() {
    setName("");
    setTargetCents(0);
    setSavedCents(0);
    setSelectedIcon("trophy-outline");
    setSelectedColor(PRESET_COLORS[0]);
    setDeadlineText("");
  }

  function openCreate() {
    resetForm();
    setTimeout(() => setCreateOpen(true), 0);
  }

  function openEdit(goal: Goal) {
    setName(goal.name);
    setTargetCents(Math.round(parseFloat(goal.targetAmount) * 100));
    setSavedCents(Math.round(parseFloat(goal.savedAmount) * 100));
    setSelectedIcon((goal.icon as IoniconName) || "trophy-outline");
    setSelectedColor(goal.color || PRESET_COLORS[0]);
    setDeadlineText(goal.deadline ? isoToDisplayDate(goal.deadline) : "");
    setTimeout(() => setEditGoal(goal), 0);
  }

  function openDeposit(goal: Goal) {
    setDepositCents(0);
    setTimeout(() => setDepositGoal(goal), 0);
  }

  function confirmDelete() {
    Alert.alert("Deletar Meta", `Deseja deletar a meta "${editGoal?.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  }

  function handleTargetKey(key: string) {
    if (key === "⌫") setTargetCents((p) => Math.floor(p / 10));
    else setTargetCents((p) => p * 10 + parseInt(key, 10));
  }

  function handleDepositKey(key: string) {
    if (key === "⌫") setDepositCents((p) => Math.floor(p / 10));
    else setDepositCents((p) => p * 10 + parseInt(key, 10));
  }

  const canCreate = name.trim().length > 0 && targetCents > 0;
  const canUpdate = name.trim().length > 0 && targetCents > 0;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Hero Card ──────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroCaption}>TOTAL GUARDADO</Text>
            <Text style={styles.heroAmount}>{formatCurrency(totalSaved)}</Text>
            <Text style={styles.heroSub}>
              {activeGoals.length} meta{activeGoals.length !== 1 ? "s" : ""}{" "}
              ativa
              {activeGoals.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.heroAddBtn}
            onPress={openCreate}
            activeOpacity={0.82}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
            <Text style={styles.heroAddBtnText}>Nova Meta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── List ───────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Metas Ativas</Text>
          {goals.length > 0 && (
            <Text style={styles.sectionCount}>{goals.length} total</Text>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : goals.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="trophy-outline"
                size={40}
                color={Colors.gray300}
              />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma meta</Text>
            <Text style={styles.emptyText}>
              Crie metas financeiras para acompanhar seu progresso de poupança.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={openCreate}
              activeOpacity={0.82}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.emptyBtnText}>Criar Meta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDeposit={openDeposit}
              onEdit={openEdit}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openCreate}
        activeOpacity={0.82}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      {/* ── Create Modal ────────────────────────────────────────────── */}
      <GoalFormModal
        visible={createOpen}
        title="Nova Meta"
        submitLabel="Criar Meta"
        name={name}
        setName={setName}
        targetCents={targetCents}
        onTargetKey={handleTargetKey}
        selectedIcon={selectedIcon}
        setSelectedIcon={setSelectedIcon}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        deadlineText={deadlineText}
        setDeadlineText={setDeadlineText}
        canSubmit={canCreate}
        isPending={createMutation.isPending}
        onSubmit={() => createMutation.mutate()}
        onClose={() => setCreateOpen(false)}
      />

      {/* ── Edit Modal ──────────────────────────────────────────────── */}
      <GoalFormModal
        visible={!!editGoal}
        title="Editar Meta"
        submitLabel="Salvar"
        name={name}
        setName={setName}
        targetCents={targetCents}
        onTargetKey={handleTargetKey}
        selectedIcon={selectedIcon}
        setSelectedIcon={setSelectedIcon}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        deadlineText={deadlineText}
        setDeadlineText={setDeadlineText}
        canSubmit={canUpdate}
        isPending={updateMutation.isPending}
        onSubmit={() => updateMutation.mutate()}
        onClose={() => setEditGoal(null)}
        onDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />

      {/* ── Deposit Modal ───────────────────────────────────────────── */}
      <Modal
        visible={!!depositGoal}
        animationType="slide"
        transparent
        onRequestClose={() => setDepositGoal(null)}
      >
        <View style={styles.overlay} pointerEvents="box-none">
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDepositGoal(null)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            {/* Goal progress header */}
            {depositGoal &&
              (() => {
                const target = parseFloat(depositGoal.targetAmount);
                const saved = parseFloat(depositGoal.savedAmount);
                const pct =
                  target > 0 ? Math.min((saved / target) * 100, 100) : 0;
                const remaining = Math.max(0, target - saved);
                const color = depositGoal.color || Colors.primary;
                const icon =
                  (depositGoal.icon as IoniconName) || "trophy-outline";
                // Quick amounts: fixed suggestions + "complete remaining" if applicable
                const remainingCents = Math.round(remaining * 100);
                const fixedChips = [50_00, 100_00, 200_00, 500_00].filter(
                  (v) => v <= remainingCents,
                );
                const chips =
                  remainingCents > 0
                    ? [...fixedChips, remainingCents].filter(
                        (v, i, arr) => arr.indexOf(v) === i,
                      )
                    : fixedChips;
                return (
                  <>
                    <View style={styles.depositHeader}>
                      <View
                        style={[
                          styles.depositIconCircle,
                          { backgroundColor: color + "22" },
                        ]}
                      >
                        <Ionicons name={icon} size={26} color={color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sheetTitle} numberOfLines={1}>
                          {depositGoal.name}
                        </Text>
                        <Text style={styles.depositProgressText}>
                          {formatCurrency(saved)} de {formatCurrency(target)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.depositProgressTrack}>
                      <View
                        style={[
                          styles.depositProgressFill,
                          {
                            width: `${pct}%` as any,
                            backgroundColor: color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.depositRemaining}>
                      Faltam {formatCurrency(remaining)} para concluir
                    </Text>

                    {chips.length > 0 && (
                      <>
                        <Text style={styles.inputLabel}>Sugestões</Text>
                        <View style={styles.quickAmountsWrapper}>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.quickAmountsRow}
                          >
                            {chips.map((v) => {
                              const isComplete = v === remainingCents;
                              const isSelected = depositCents === v;
                              return (
                                <TouchableOpacity
                                  key={v}
                                  style={[
                                    styles.quickChip,
                                    isSelected && {
                                      backgroundColor: color,
                                      borderColor: color,
                                    },
                                  ]}
                                  onPress={() => setDepositCents(v)}
                                  activeOpacity={0.75}
                                >
                                  <Text
                                    style={[
                                      styles.quickChipText,
                                      isSelected && { color: Colors.white },
                                    ]}
                                  >
                                    {isComplete ? "🎯 " : ""}
                                    {centsToDisplay(v)}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        </View>
                      </>
                    )}
                  </>
                );
              })()}

            <Text style={styles.inputLabel}>Valor personalizado</Text>
            <View style={styles.amountBox}>
              <Text style={styles.amountText}>
                {centsToDisplay(depositCents)}
              </Text>
            </View>
            <Numpad onKey={handleDepositKey} />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                depositCents === 0 && styles.submitBtnDisabled,
              ]}
              onPress={() => depositMutation.mutate()}
              disabled={depositCents === 0 || depositMutation.isPending}
              activeOpacity={0.85}
            >
              {depositMutation.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  Depositar{" "}
                  {depositCents > 0 ? centsToDisplay(depositCents) : ""}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Goal Form Modal ──────────────────────────────────────────────────────────
interface GoalFormModalProps {
  visible: boolean;
  title: string;
  submitLabel: string;
  name: string;
  setName: (v: string) => void;
  targetCents: number;
  onTargetKey: (key: string) => void;
  selectedIcon: IoniconName;
  setSelectedIcon: (v: IoniconName) => void;
  selectedColor: string;
  setSelectedColor: (v: string) => void;
  deadlineText: string;
  setDeadlineText: (v: string) => void;
  canSubmit: boolean;
  isPending: boolean;
  onSubmit: () => void;
  onClose: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

function GoalFormModal({
  visible,
  title,
  submitLabel,
  name,
  setName,
  targetCents,
  onTargetKey,
  selectedIcon,
  setSelectedIcon,
  selectedColor,
  setSelectedColor,
  deadlineText,
  setDeadlineText,
  canSubmit,
  isPending,
  onSubmit,
  onClose,
  onDelete,
  isDeleting,
}: GoalFormModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, styles.sheetTall]}>
          <View style={styles.sheetHandle} />

          {/* Header row */}
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>{title}</Text>
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                disabled={isDeleting}
                style={styles.deleteIconBtn}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={Colors.danger} />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.danger}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={styles.inputLabel}>Nome da meta</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Viagem para Europa"
              placeholderTextColor={Colors.textDisabled}
            />

            {/* Target amount */}
            <Text style={styles.inputLabel}>Valor Alvo</Text>
            <View style={styles.amountBox}>
              <Text style={styles.amountText}>
                {centsToDisplay(targetCents)}
              </Text>
            </View>
            <Numpad onKey={onTargetKey} />

            {/* Deadline */}
            <Text style={styles.inputLabel}>Prazo (opcional)</Text>
            <TextInput
              style={styles.textInput}
              value={deadlineText}
              onChangeText={(v) => setDeadlineText(maskDate(v))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="numeric"
              maxLength={10}
            />

            {/* Icon picker */}
            <Text style={styles.inputLabel}>Ícone</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.iconPickerRow}
            >
              {PRESET_ICONS.map((icon) => {
                const isSelected = selectedIcon === icon;
                return (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      isSelected && {
                        backgroundColor: selectedColor + "33",
                        borderColor: selectedColor,
                      },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={icon}
                      size={22}
                      color={isSelected ? selectedColor : Colors.gray400}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Color picker */}
            <Text style={styles.inputLabel}>Cor</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                  activeOpacity={0.8}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={onSubmit}
              disabled={!canSubmit || isPending}
              activeOpacity={0.85}
            >
              {isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>{submitLabel}</Text>
              )}
            </TouchableOpacity>
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Hero ────────────────────────────────────────────────────────────
  hero: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md + 4,
    padding: Spacing.lg,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  heroCaption: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heroAmount: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 4,
  },
  heroAddBtn: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: 4,
  },
  heroAddBtnText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Scroll ───────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },

  // ── Section ──────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },

  // ── Goal Card ─────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  cardMeta: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
  },
  cardEditBtn: {
    padding: 4,
    marginLeft: Spacing.xs,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  completedBadgeText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: "600",
  },
  cardDeadline: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  cardPct: {
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  cardAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cardSaved: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  cardTarget: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  depositBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    marginTop: 2,
  },
  depositBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Deposit Modal Header ──────────────────────────────────────────────
  depositHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  depositIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  depositProgressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  depositProgressTrack: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  depositProgressFill: {
    height: 8,
    borderRadius: 4,
  },
  depositRemaining: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: "right",
  },
  quickAmountsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  quickAmountsWrapper: {
    height: 44,
    marginBottom: Spacing.sm,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

  // ── FAB ──────────────────────────────────────────────────────────────
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  // ── Empty ─────────────────────────────────────────────────────────────
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  emptyBtnText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Modal / Sheet ─────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.sm,
    maxHeight: "85%",
  },
  sheetTall: {
    maxHeight: "92%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray200,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  deleteIconBtn: {
    padding: 6,
  },

  // ── Form ──────────────────────────────────────────────────────────────
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  amountBox: {
    backgroundColor: Colors.gray50,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountText: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  // ── Numpad ────────────────────────────────────────────────────────────
  numpad: {
    gap: 8,
    marginBottom: Spacing.md,
  },
  numpadRow: {
    flexDirection: "row",
    gap: 8,
  },
  numKey: {
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  numKeyDelete: {
    backgroundColor: Colors.gray100,
  },
  numKeyBlank: {
    flex: 1,
  },
  numKeyText: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 28,
  },

  // ── Icon & Color pickers ──────────────────────────────────────────────
  iconPickerRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  iconOption: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray50,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 4,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  // ── Submit ────────────────────────────────────────────────────────────
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
