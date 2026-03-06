import { Sidebar } from "@/components/Sidebar";
import { Colors } from "@/constants/theme";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar.context";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

function AppLayoutInner() {
  const { isOpen, close } = useSidebar();

  return (
    <View style={{ flex: 1 }}>
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
            fontWeight: "600",
            letterSpacing: 0.3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "HOME",
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
            title: "REPORTS",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "bar-chart" : "bar-chart-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="budgets/index"
          options={{
            title: "BUDGET",
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
            title: "PROFILE",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
        {/* Hidden from tab bar — accessible via sidebar/navigation */}
        <Tabs.Screen name="accounts/index" options={{ href: null }} />
      </Tabs>

      <Sidebar visible={isOpen} onClose={close} />
    </View>
  );
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutInner />
    </SidebarProvider>
  );
}
