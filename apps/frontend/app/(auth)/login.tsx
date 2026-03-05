import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

function ChartIllustration() {
  const bars = [
    { height: 32, opacity: 0.4 },
    { height: 52, opacity: 0.55 },
    { height: 44, opacity: 0.45 },
    { height: 68, opacity: 0.7 },
    { height: 56, opacity: 0.6 },
    { height: 80, opacity: 0.85 },
  ];
  return (
    <View style={illustration.container}>
      <View style={illustration.bars}>
        {bars.map((bar, i) => (
          <View
            key={i}
            style={[
              illustration.bar,
              { height: bar.height, opacity: bar.opacity },
            ]}
          />
        ))}
      </View>
      <View style={illustration.trendLine}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[illustration.trendDot, { marginBottom: i * 7 }]}
          />
        ))}
      </View>
    </View>
  );
}

const illustration = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 90,
    gap: 8,
  },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  bar: {
    width: 28,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  trendLine: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  trendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryDark,
    opacity: 0.8,
  },
});

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    try {
      const { user } = await authService.login(values);
      setUser(user);
      router.replace("/(app)");
    } catch {
      setError("password", { message: "E-mail ou senha incorretos" });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* App Header */}
          <View style={styles.appHeader}>
            <View style={styles.appIconBadge}>
              <Ionicons name="wallet" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>FinanceFlow</Text>
          </View>

          {/* Hero Card */}
          <View style={styles.heroCard}>
            <ChartIllustration />
          </View>

          {/* Welcome Text */}
          <Text style={styles.title}>Welcome to{"\n"}FinanceFlow</Text>
          <Text style={styles.subtitle}>
            Your professional and approachable path{"\n"}to financial freedom.
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.email && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={Colors.gray400}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      placeholderTextColor={Colors.gray400}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.password && styles.inputWrapperError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={Colors.gray400}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={Colors.gray400}
                      secureTextEntry
                      autoComplete="password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.75}
              >
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="logo-apple"
                  size={18}
                  color={Colors.textPrimary}
                />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{"Don't have an account? "}</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign up for free</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  appIconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.iconBadge,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  heroCard: {
    backgroundColor: Colors.heroBackground,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
  },
  title: {
    fontSize: 26,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  form: { gap: 0 },
  field: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  inputWrapperError: { borderColor: Colors.danger },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    height: "100%",
  },
  errorText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.danger,
    marginTop: 4,
  },
  loginButton: {
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  loginButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
    fontWeight: Typography.fontWeights.medium,
    letterSpacing: 0.5,
  },
  socialRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  googleG: {
    fontSize: 16,
    fontWeight: Typography.fontWeights.bold,
    color: "#4285F4",
  },
  socialText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Spacing.sm,
  },
  footerText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
});
