import React from 'react';
import { Text, TextStyle } from 'react-native';

const ICONS: Record<string, string> = {
  'house.fill': '🏠', 'chart.bar.fill': '📊',
  'person.fill': '👤', 'gear': '⚙️',
  'plus.circle.fill': '➕', 'trash': '🗑️',
  'pencil': '✏️', 'checkmark': '✓',
  'xmark': '✕', 'arrow.left': '←',
};

export function IconSymbol({ name, size = 24, color = '#000', style }: {
  name: string; size?: number; color?: string; style?: TextStyle;
}) {
  return <Text style={[{ fontSize: size * 0.8, color }, style]}>{ICONS[name] ?? '●'}</Text>;
}