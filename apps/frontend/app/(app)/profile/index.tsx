import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const nameSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(100),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
      .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
      .regex(/[0-9]/, "Deve conter ao menos um número"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type NameForm = z.infer<typeof nameSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

// ─── Row component ────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
      )}
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function handleSaveName(values: NameForm) {
    try {
      const updated = await authService.updateProfile({ name: values.name });
      setUser({ ...user!, ...updated });
      setNameModalOpen(false);
    } catch {
      nameForm.setError("name", {
        message: "Não foi possível atualizar o nome.",
      });
    }
  }

  async function handleChangePassword(values: PasswordForm) {
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        password: values.newPassword,
      });
      passwordForm.reset();
      setPasswordModalOpen(false);
      Alert.alert("Sucesso", "Senha alterada com sucesso.");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        passwordForm.setError("currentPassword", {
          message: "Senha atual incorreta",
        });
      } else {
        passwordForm.setError("currentPassword", {
          message: "Erro ao alterar senha. Tente novamente.",
        });
      }
    }
  }

  function confirmLogout() {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: logout },
    ]);
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{user.name}</Text>
          <Text style={styles.heroEmail}>{user.email}</Text>
          {"createdAt" in user && (
            <View style={styles.memberBadge}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={Colors.primary}
              />
              <Text style={styles.memberText}>
                Membro desde{" "}
                {formatMemberSince((user as { createdAt: string }).createdAt)}
              </Text>
            </View>
          )}
        </View>

        {/* ── Conta ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.card}>
            <InfoRow
              icon="person-outline"
              label="Nome"
              value={user.name}
              onPress={() => {
                nameForm.reset({ name: user.name });
                setNameModalOpen(true);
              }}
            />
            <View style={styles.separator} />
            <InfoRow icon="mail-outline" label="E-mail" value={user.email} />
          </View>
        </View>

        {/* ── Segurança ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança</Text>
          <View style={styles.card}>
            <InfoRow
              icon="lock-closed-outline"
              label="Alterar senha"
              value="••••••••"
              onPress={() => {
                passwordForm.reset();
                setPasswordModalOpen(true);
              }}
            />
          </View>
        </View>

        {/* ── Sobre ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.card}>
            <InfoRow
              icon="phone-portrait-outline"
              label="Aplicativo"
              value="MyFinance"
            />
            <View style={styles.separator} />
            <InfoRow icon="code-slash-outline" label="Versão" value="1.0.0" />
          </View>
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={confirmLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Modal: editar nome ── */}
      <Modal visible={nameModalOpen} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setNameModalOpen(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalWrapper}
          pointerEvents="box-none"
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar nome</Text>
            <Controller
              control={nameForm.control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.modalInput,
                    nameForm.formState.errors.name && styles.modalInputError,
                  ]}
                  placeholder="Seu nome"
                  placeholderTextColor={Colors.gray400}
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoFocus
                />
              )}
            />
            {nameForm.formState.errors.name && (
              <Text style={styles.errorText}>
                {nameForm.formState.errors.name.message}
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setNameModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirm,
                  nameForm.formState.isSubmitting && styles.buttonDisabled,
                ]}
                onPress={nameForm.handleSubmit(handleSaveName)}
                disabled={nameForm.formState.isSubmitting}
              >
                <Text style={styles.modalConfirmText}>
                  {nameForm.formState.isSubmitting ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal: alterar senha ── */}
      <Modal visible={passwordModalOpen} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setPasswordModalOpen(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalWrapper}
          pointerEvents="box-none"
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Alterar senha</Text>

            <Text style={styles.modalLabel}>Senha atual</Text>
            <Controller
              control={passwordForm.control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.pwdWrapper,
                    passwordForm.formState.errors.currentPassword &&
                      styles.modalInputError,
                  ]}
                >
                  <TextInput
                    style={styles.pwdInput}
                    placeholder="Senha atual"
                    placeholderTextColor={Colors.gray400}
                    secureTextEntry={!showCurrent}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <TouchableOpacity onPress={() => setShowCurrent((v) => !v)}>
                    <Ionicons
                      name={showCurrent ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={Colors.gray400}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {passwordForm.formState.errors.currentPassword && (
              <Text style={styles.errorText}>
                {passwordForm.formState.errors.currentPassword.message}
              </Text>
            )}

            <Text style={[styles.modalLabel, { marginTop: Spacing.sm }]}>
              Nova senha
            </Text>
            <Controller
              control={passwordForm.control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.pwdWrapper,
                    passwordForm.formState.errors.newPassword &&
                      styles.modalInputError,
                  ]}
                >
                  <TextInput
                    style={styles.pwdInput}
                    placeholder="Mín. 8 car., A-Z, a-z, 0-9"
                    placeholderTextColor={Colors.gray400}
                    secureTextEntry={!showNew}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <TouchableOpacity onPress={() => setShowNew((v) => !v)}>
                    <Ionicons
                      name={showNew ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={Colors.gray400}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {passwordForm.formState.errors.newPassword && (
              <Text style={styles.errorText}>
                {passwordForm.formState.errors.newPassword.message}
              </Text>
            )}

            <Text style={[styles.modalLabel, { marginTop: Spacing.sm }]}>
              Confirmar nova senha
            </Text>
            <Controller
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.pwdWrapper,
                    passwordForm.formState.errors.confirmPassword &&
                      styles.modalInputError,
                  ]}
                >
                  <TextInput
                    style={styles.pwdInput}
                    placeholder="Repita a nova senha"
                    placeholderTextColor={Colors.gray400}
                    secureTextEntry={!showConfirm}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
                    <Ionicons
                      name={showConfirm ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={Colors.gray400}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <Text style={styles.errorText}>
                {passwordForm.formState.errors.confirmPassword.message}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setPasswordModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirm,
                  passwordForm.formState.isSubmitting && styles.buttonDisabled,
                ]}
                onPress={passwordForm.handleSubmit(handleChangePassword)}
                disabled={passwordForm.formState.isSubmitting}
              >
                <Text style={styles.modalConfirmText}>
                  {passwordForm.formState.isSubmitting
                    ? "Salvando..."
                    : "Alterar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxl },

  // Hero
  hero: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  heroName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  heroEmail: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  memberText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },

  // Sections
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 52 },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  rowBody: { flex: 1 },
  rowLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },

  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    height: 52,
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.md,
  },
  logoutText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.danger,
  },

  // Modal
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: 4,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  modalLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: 4,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  modalInputError: { borderColor: Colors.danger },
  pwdWrapper: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  pwdInput: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.danger,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalCancel: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  modalConfirm: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
  },
  modalConfirmText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.white,
    fontWeight: Typography.fontWeights.semibold,
  },
  buttonDisabled: { opacity: 0.6 },
});
