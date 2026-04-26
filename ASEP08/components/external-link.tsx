import React from 'react';
import { Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={() => Linking.openURL(href)}>
      <Text style={[styles.link, { color: colors.accent }]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: { textDecorationLine: 'underline', fontSize: 15 },
});