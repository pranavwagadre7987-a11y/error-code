import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props extends ViewProps { card?: boolean; }

export function ThemedView({ card, style, ...props }: Props) {
  const { colors, shadow } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: card ? colors.surface : colors.background },
        card && styles.card,
        card && shadow.card,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16 },
});