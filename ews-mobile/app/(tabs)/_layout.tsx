import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../../contexts/AlertContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { palette } from '../../theme/colors';

function TabIcon({ name, color, label, badge }: {
  name: keyof typeof Ionicons.glyphMap; color: any; label: string; badge?: boolean;
}) {
  return (
    <View style={styles.tabItem}>
      <View>
        <Ionicons name={name} size={26} color={color} />
        {badge && <View style={styles.badge} />}
      </View>
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { currentAlert } = useAlert();
  const { adaptiveSettings } = useUserPreferences();
  const hasAlert = !!currentAlert;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: palette.blue[500],
        tabBarInactiveTintColor: palette.slate[500],
        tabBarShowLabel: false,
        // G18: Hide tab bar during active danger alert (focus only on alert actions)
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon name="home" color={color} label="HOME" />
          ),
        }}
      />
      <Tabs.Screen
        name="alert"
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon name="warning" color={hasAlert ? palette.red[500] : color} label="ALERT" badge={hasAlert} />
          ),
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon name="checkbox" color={color} label="PLAN" />
          ),
        }}
      />
      <Tabs.Screen
        name="helpers"
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon name="people" color={color} label="HELP" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon name="settings" color={color} label="SET" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: palette.white,
    borderTopWidth: 2,
    borderTopColor: palette.slate[200],
    height: 72,
    paddingBottom: 8,
    paddingTop: 4,
    elevation: 12,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  badge: {
    position: 'absolute', top: -2, right: -4,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: palette.red[500], borderWidth: 2, borderColor: palette.white,
  },
});
