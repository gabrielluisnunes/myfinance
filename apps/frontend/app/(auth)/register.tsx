import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterForm) {
    try {
      await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      router.replace("/(auth)/login");
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? "Erro ao criar conta";
      setError("email", { message: msg });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>MyFinance</Text>
          <Text style={styles.subtitle}>Crie sua conta gratuitamente</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Criar conta</Text>

          {(["name", "email", "password", "confirmPassword"] as const).map(
            (fieldName) => (
              <View key={fieldName} style={styles.field}>
                <Text style={styles.label}>
                  {fieldName === "name" && "Nome completo"}
                  {fieldName === "email" && "E-mail"}
                  {fieldName === "password" && "Senha"}
                  {fieldName === "confirmPassword" && "Confirmar senha"}
                </Text>
                <Controller
                  control={control}
                  name={fieldName}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        errors[fieldName] && styles.inputError,
                      ]}
                      placeholder={
                        fieldName === "name"
                          ? "Seu nome"
                          : fieldName === "email"
                            ? "seu@email.com"
                            : "••••••••"
                      }
                      placeholderTextColor={Colors.gray400}
                      keyboardType={
                        fieldName === "email" ? "email-address" : "default"
                      }
                      autoCapitalize={fieldName === "name" ? "words" : "none"}
                      secureTextEntry={
                        fieldName === "password" ||
                        fieldName === "confirmPassword"
                      }
                      autoComplete={
                        fieldName === "email"
                          ? "email"
                          : fieldName === "password"
                            ? "new-password"
                            : "off"
                      }
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors[fieldName] && (
                  <Text style={styles.errorText}>
                    {errors[fieldName]?.message}
                  </Text>
                )}
              </View>
            ),
          )}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Entrar</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: "center", padding: Spacing.lg },
  header: { alignItems: "center", marginBottom: Spacing.xl },
  logo: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  field: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.gray50,
  },
  inputError: { borderColor: Colors.danger },
  errorText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  button: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.white,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
});
