import { ThemedText } from '@/components/themed-text';
import { useBudget } from '@/hooks/useBudget';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BudgetScreen() {
  const { colors, spacing, shadow } = useTheme();
  const { categoryStats, monthlyData, expenses, profile } = useBudget();
  const [view, setView] = useState<'categories' | 'chart'>('categories');

  const fmt = (n: number) => profile.currency + n.toLocaleString('en-IN');
  const maxSpent = Math.max(...monthlyData.map(m => m.spent), 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>

        <ThemedText variant="caption" color={colors.text.muted}>
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </ThemedText>
        <ThemedText variant="title" style={{ marginBottom: spacing.md }}>Budget Tracker</ThemedText>

        {/* View Toggle */}
        <View style={[styles.toggle, { backgroundColor: colors.border }]}>
          {(['categories', 'chart'] as const).map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.toggleBtn, view === v && { backgroundColor: colors.surface, ...shadow.soft }]}
              onPress={() => setView(v)}
            >
              <Text style={{ color: view === v ? colors.accent : colors.text.muted, fontWeight: '600', fontSize: 13 }}>
                {v === 'categories' ? '📋 Categories' : '📊 Chart'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {view === 'categories' ? (
          <>
            {/* Total Spent Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.accentLight }]}>
              <View>
                <ThemedText variant="caption" color={colors.accent}>Total Spent This Month</ThemedText>
                <ThemedText variant="title" color={colors.accent}>{fmt(expenses)}</ThemedText>
              </View>
              <Text style={{ fontSize: 32 }}>📊</Text>
            </View>

            {/* Category Cards */}
            {categoryStats.filter(c => c.budget > 0).map(cat => {
              const pct = Math.min((cat.spent / cat.budget) * 100, 100);
              return (
                <View key={cat.id} style={[styles.catCard, { backgroundColor: colors.surface }, shadow.soft]}>
                  <View style={styles.catHeader}>
                    <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                      <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <ThemedText variant="label">{cat.name}</ThemedText>
                      <ThemedText variant="caption" color={colors.text.muted}>
                        {fmt(cat.spent)} of {fmt(cat.budget)}
                      </ThemedText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <ThemedText variant="label" color={cat.over ? colors.danger : colors.success}>
                        {cat.over ? '⚠️ Over!' : fmt(cat.remaining) + ' left'}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.text.muted}>{Math.round(pct)}%</ThemedText>
                    </View>
                  </View>
                  <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                    <View style={[
                      styles.progressFill,
                      { width: `${pct}%`, backgroundColor: cat.over ? colors.danger : cat.color }
                    ]} />
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <>
            {/* Bar Chart */}
            <ThemedText variant="subtitle" style={{ marginBottom: spacing.md }}>
              Monthly Spending (Last 6 Months)
            </ThemedText>
            <View style={[styles.chartCard, { backgroundColor: colors.surface }, shadow.soft]}>
              <View style={styles.barsRow}>
                {monthlyData.map((m, i) => {
                  const h = Math.max((m.spent / maxSpent) * 140, 4);
                  return (
                    <View key={i} style={styles.barWrap}>
                      <ThemedText variant="caption" color={colors.text.muted} style={{ marginBottom: 4 }}>
                        {fmt(m.spent).replace('₹', '₹\n')}
                      </ThemedText>
                      <View style={[styles.bar, { height: h, backgroundColor: colors.accent, opacity: 0.7 + (i / monthlyData.length) * 0.3 }]} />
                      <ThemedText variant="caption" color={colors.text.muted} style={{ marginTop: 6 }}>
                        {m.label}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Insight Card */}
            <View style={[styles.insightCard, { backgroundColor: colors.warningLight, borderLeftColor: colors.warning, borderLeftWidth: 4 }]}>
              <Text style={{ fontSize: 24 }}>💡</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText variant="label" color={colors.warning}>Smart Insight</ThemedText>
                <ThemedText variant="caption" color={colors.text.secondary}>
                  {expenses > 40000
                    ? 'You\'re spending heavily this month. Consider reviewing your Shopping & Food budgets.'
                    : 'Great job! Your spending is within healthy limits this month.'}
                </ThemedText>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  toggle:      { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 16 },
  toggleBtn:   { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 16 },
  catCard:     { borderRadius: 16, padding: 16, marginBottom: 12 },
  catHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox:     { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  progressBg:  { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill:{ height: 8, borderRadius: 4 },
  chartCard:   { borderRadius: 16, padding: 20, marginBottom: 16 },
  barsRow:     { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 200 },
  barWrap:     { alignItems: 'center', flex: 1 },
  bar:         { width: 28, borderRadius: 6 },
  insightCard: { flexDirection: 'row', borderRadius: 12, padding: 16, alignItems: 'center' },
});