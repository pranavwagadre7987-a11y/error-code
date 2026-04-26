import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useBudget } from '@/hooks/useBudget';
import { ThemedText } from '@/components/themed-text';

export default function BudgetScreen() {
  const { colors, spacing, shadow } = useTheme();
  const { categories } = useBudget();

  const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>

        <ThemedText variant="caption" color={colors.text.muted}>April 2026</ThemedText>
        <ThemedText variant="title" style={{ marginBottom: spacing.lg }}>Budget Tracker</ThemedText>

        {categories.map(cat => {
          const pct     = Math.min((cat.spent / cat.budget) * 100, 100);
          const over    = cat.spent > cat.budget;
          const barColor = over ? colors.danger : cat.color;

          return (
            <View key={cat.id} style={[styles.card, { backgroundColor: colors.surface }, shadow.soft]}>
              <View style={styles.catHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                  <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ThemedText variant="label">{cat.name}</ThemedText>
                  <ThemedText variant="caption" color={colors.text.muted}>
                    {formatINR(cat.spent)} of {formatINR(cat.budget)}
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText
                    variant="label"
                    color={over ? colors.danger : colors.text.primary}
                  >
                    {over ? 'Over!' : `${formatINR(cat.budget - cat.spent)} left`}
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.text.muted}>
                    {Math.round(pct)}%
                  </ThemedText>
                </View>
              </View>

              {/* Progress */}
              <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pct}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
            </View>
          );
        })}

        {/* Summary footer */}
        <View style={[styles.summaryCard, { backgroundColor: colors.accentLight }]}>
          <Text style={{ fontSize: 28 }}>💡</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ThemedText variant="label" color={colors.accent}>Tip of the month</ThemedText>
            <ThemedText variant="caption" color={colors.text.secondary}>
              You overspent on Shopping by ₹400. Consider reallocating from next month's budget.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card:        { borderRadius: 16, padding: 16, marginBottom: 12 },
  catHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox:     { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  progressBg:  { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill:{ height: 8, borderRadius: 4 },
  summaryCard: { flexDirection: 'row', borderRadius: 16, padding: 16, marginTop: 8, alignItems: 'center' },
});