import React from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useBudget } from '@/hooks/useBudget';
import { ThemedText } from '@/components/themed-text';

export default function OverviewScreen() {
  const { colors, spacing, radius, shadow } = useTheme();
  const { totalBudget, totalSpent, totalSaved, spentPct, transactions } = useBudget();

  const formatINR = (n: number) =>
    '₹' + Math.abs(n).toLocaleString('en-IN');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>

        {/* Header */}
        <View style={styles.row}>
          <View>
            <ThemedText variant="caption" color={colors.text.muted}>April 2026</ThemedText>
            <ThemedText variant="title">Good morning 👋</ThemedText>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.accentLight }]}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </View>
        </View>

        {/* Balance Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.accent }, shadow.card]}>
          <ThemedText variant="caption" color="rgba(255,255,255,0.7)">Total Budget</ThemedText>
          <ThemedText variant="display" color="#fff" style={{ marginVertical: 4 }}>
            {formatINR(totalBudget)}
          </ThemedText>

          <View style={styles.heroRow}>
            <View>
              <ThemedText variant="caption" color="rgba(255,255,255,0.7)">Spent</ThemedText>
              <ThemedText variant="subtitle" color="#fff">{formatINR(totalSpent)}</ThemedText>
            </View>
            <View style={styles.divider} />
            <View>
              <ThemedText variant="caption" color="rgba(255,255,255,0.7)">Remaining</ThemedText>
              <ThemedText variant="subtitle" color="#fff">{formatINR(totalSaved)}</ThemedText>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min(spentPct, 100)}%` }]} />
          </View>
          <ThemedText variant="caption" color="rgba(255,255,255,0.7)" style={{ marginTop: 6 }}>
            {spentPct}% of budget used
          </ThemedText>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Income',   value: '₹55,000', icon: '↑', bg: colors.accentLight,  textColor: colors.accent },
            { label: 'Expenses', value: '₹36,500', icon: '↓', bg: colors.dangerLight,  textColor: colors.danger },
          ].map(stat => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.bg }, shadow.soft]}>
              <Text style={{ fontSize: 22 }}>{stat.icon}</Text>
              <ThemedText variant="label" color={stat.textColor}>{stat.value}</ThemedText>
              <ThemedText variant="caption" color={colors.text.muted}>{stat.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <ThemedText variant="subtitle" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          Recent Transactions
        </ThemedText>

        <View style={[styles.card, { backgroundColor: colors.surface }, shadow.soft]}>
          {transactions.map((tx, i) => (
            <View key={tx.id}>
              <View style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: colors.background }]}>
                  <Text style={{ fontSize: 20 }}>{tx.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ThemedText variant="label">{tx.title}</ThemedText>
                  <ThemedText variant="caption" color={colors.text.muted}>{tx.date} · {tx.category}</ThemedText>
                </View>
                <ThemedText
                  variant="label"
                  color={tx.amount > 0 ? colors.success : colors.text.primary}
                >
                  {tx.amount > 0 ? '+' : ''}{formatINR(tx.amount)}
                </ThemedText>
              </View>
              {i < transactions.length - 1 && (
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  avatar:     { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  heroCard:   { borderRadius: 20, padding: 24, marginBottom: 16 },
  heroRow:    { flexDirection: 'row', marginTop: 16, gap: 24 },
  divider:    { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginTop: 16 },
  progressFill:{ height: 6, backgroundColor: '#fff', borderRadius: 3 },
  statsRow:   { flexDirection: 'row', gap: 12 },
  statCard:   { flex: 1, borderRadius: 14, padding: 16, gap: 4 },
  card:       { borderRadius: 16, overflow: 'hidden' },
  txRow:      { flexDirection: 'row', alignItems: 'center', padding: 14 },
  txIcon:     { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  separator:  { height: 1, marginHorizontal: 14 },
});