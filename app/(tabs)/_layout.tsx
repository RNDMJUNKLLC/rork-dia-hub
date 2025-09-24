import { Tabs } from "expo-router";
import { Package, Settings, Activity, Clock } from "lucide-react-native";
import React from "react";
import { SuppliesProvider } from "@/hooks/supplies-store";
import { useTheme } from "@/hooks/theme-store";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useOnboarding } from "@/hooks/onboarding";

function TabLayout() {
  const { colors } = useTheme();
  const { isOnboardingCompleted, isLoading, completeOnboarding } = useOnboarding();

  const handleOnboardingClose = () => {
    completeOnboarding();
  };
  
  return (
    <>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.cardBackground,
        },
        headerTitleStyle: {
          fontWeight: '600' as const,
          color: colors.text,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Supplies",
          headerTitle: "Diabetes Supplies",
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="in-use"
        options={{
          title: "In Use",
          headerTitle: "Active Items",
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerTitle: "Activity History",
          tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
      
      <OnboardingModal 
        visible={!isLoading && !isOnboardingCompleted}
        onClose={handleOnboardingClose}
      />
    </>
  );
}

export default function TabsLayout() {
  return (
    <SuppliesProvider>
      <TabLayout />
    </SuppliesProvider>
  );
}