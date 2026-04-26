import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';

interface ThemedTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

export function ThemedText({ variant = 'body', color, style, ...props }: ThemedTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles[variant],
        { color: color ?? colors.text.primary },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  display:  { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  title:    { fontSize: 22, fontWeight: '600', letterSpacing: -0.5 },
  subtitle: { fontSize: 17, fontWeight: '500' },
  body:     { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption:  { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  label:    { fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
});