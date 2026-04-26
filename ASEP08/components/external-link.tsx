import React from 'react';
import { Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={() => Linking.openURL(href)}>
      <Text style={[styles.link, { color: colors.accent }]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ link: { textDecorationLine: 'underline', fontSize: 15 } });