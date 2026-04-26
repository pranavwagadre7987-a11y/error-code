import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useTheme';
import { router, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color }) => <IconSymbol name="chart.bar.fill" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={[styles.fab, { backgroundColor: colors.accent }]}>
              <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32 }}>+</Text>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} onPress={() => router.push('/modal')} style={styles.fabWrap} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol name="person.fill" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
    shadowColor: '#2D6A4F', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
});