import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconName;
  activeIcon: IoniconName;
}

const TABS: TabConfig[] = [
  { name: "index", title: "Início", icon: "home-outline", activeIcon: "home" },
  {
    name: "transactions/index",
    title: "Transações",
    icon: "swap-horizontal-outline",
    activeIcon: "swap-horizontal",
  },
  {
    name: "accounts/index",
    title: "Contas",
    icon: "wallet-outline",
    activeIcon: "wallet",
  },
  {
    name: "budgets/index",
    title: "Orçamento",
    icon: "pie-chart-outline",
    activeIcon: "pie-chart",
  },
  {
    name: "profile/index",
    title: "Perfil",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions/index"
        options={{
          title: "Transações",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "swap-horizontal" : "swap-horizontal-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts/index"
        options={{
          title: "Contas",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets/index"
        options={{
          title: "Orçamento",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "pie-chart" : "pie-chart-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
