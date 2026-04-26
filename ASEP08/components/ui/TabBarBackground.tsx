import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function TabBarBackground() {
  const { colors } = useTheme();
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
      ]}
    />
  );
}

export default TabBarBackground;