import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(290, SCREEN_WIDTH * 0.8);

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface MenuItem {
  label: string;
  icon: IoniconName;
  activeIcon: IoniconName;
  route: string | null;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", icon: "grid-outline", activeIcon: "grid", route: "/" },
  {
    label: "Transactions",
    icon: "receipt-outline",
    activeIcon: "receipt",
    route: "/transactions",
  },
  {
    label: "Budgets",
    icon: "analytics-outline",
    activeIcon: "analytics",
    route: "/budgets",
  },
  {
    label: "Reports",
    icon: "bar-chart-outline",
    activeIcon: "bar-chart",
    route: "/transactions",
  },
  {
    label: "Financial Goals",
    icon: "flag-outline",
    activeIcon: "flag",
    route: null,
  },
  {
    label: "Settings",
    icon: "settings-outline",
    activeIcon: "settings",
    route: null,
  },
];

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export function Sidebar({ visible, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <View
      pointerEvents={visible ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, styles.root]}
    >
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <SafeAreaView edges={["top"]} style={styles.drawerSafe}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.appBadge}>
              <Ionicons name="wallet" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.appName}>FinanceFlow</Text>
              <Text style={styles.appTagline}>Manage your wealth</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Menu Items */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => {
            const isActive =
              item.route === "/"
                ? pathname === "/"
                : item.route !== null && pathname.startsWith(item.route);
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => {
                  if (item.route) {
                    router.push(item.route as never);
                    onClose();
                  }
                }}
                activeOpacity={0.7}
                disabled={!item.route}
              >
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={20}
                  color={isActive ? Colors.primary : Colors.gray500}
                />
                <Text
                  style={[
                    styles.menuLabel,
                    isActive && styles.menuLabelActive,
                    !item.route && styles.menuLabelDisabled,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View style={styles.quickActionsHeader}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <Text style={styles.expandLabel}>EXPAND</Text>
          </View>
          <View style={styles.quickActionRow}>
            <View style={styles.quickActionItem}>
              <TouchableOpacity
                style={[
                  styles.quickActionBtn,
                  { backgroundColor: Colors.successLight },
                ]}
              >
                <Ionicons name="add" size={22} color={Colors.success} />
              </TouchableOpacity>
              <Text style={styles.quickActionLabel}>Income</Text>
            </View>
            <View style={styles.quickActionItem}>
              <TouchableOpacity
                style={[
                  styles.quickActionBtn,
                  { backgroundColor: Colors.dangerLight },
                ]}
              >
                <Ionicons name="remove" size={22} color={Colors.danger} />
              </TouchableOpacity>
              <Text style={styles.quickActionLabel}>Expense</Text>
            </View>
            <View style={styles.quickActionItem}>
              <TouchableOpacity
                style={[
                  styles.quickActionBtn,
                  { backgroundColor: Colors.primaryLight },
                ]}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={22}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.quickActionLabel}>Transfer</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerSafe: { backgroundColor: Colors.surface },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appBadge: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.iconBadge,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  appTagline: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  menu: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  menuItemActive: { backgroundColor: Colors.iconBadge },
  menuLabel: {
    fontSize: Typography.fontSizes.md,
    color: Colors.gray500,
    fontWeight: Typography.fontWeights.medium,
  },
  menuLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },
  menuLabelDisabled: { opacity: 0.4 },
  quickActions: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickActionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  quickActionsTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  expandLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
    letterSpacing: 0.5,
  },
  quickActionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickActionItem: { alignItems: "center", gap: 6 },
  quickActionBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
});
