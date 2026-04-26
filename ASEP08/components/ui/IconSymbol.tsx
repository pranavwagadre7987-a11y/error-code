import React from 'react';
import { Text, TextStyle } from 'react-native';

const ICONS: Record<string, string> = {
  'house.fill':        '🏠',
  'paperplane.fill':   '✉️',
  'chevron.right':     '›',
  'chart.bar.fill':    '📊',
  'plus.circle.fill':  '➕',
  'person.fill':       '👤',
  'gear':              '⚙️',
  'arrow.up.circle':   '↑',
  'arrow.down.circle': '↓',
  'wallet.pass.fill':  '💳',
};

export function IconSymbol({ name, size = 24, color = '#000', style }: {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}) {
  return (
    <Text style={[{ fontSize: size * 0.8, color }, style]}>
      {ICONS[name] ?? '●'}
    </Text>
  );
}