import { ThemedText } from '@/components/themed-text';
import { PRIORITY_CONFIG } from '@/constants';
import { useBudget } from '@/hooks/useBudget';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BudgetScreen() {
  const { colors, spacing, shadow } = useTheme();
  const { categoryStats, monthlyData, expenses, profile, priorityAlerts, budgetShifts, prioritySummary } = useBudget();
  const [view, setView] = useState<'categories' | 'chart'>('categories');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const fmt = (n: number) => profile.currency + n.toLocaleString('en-IN');
  const maxSpent = Math.max(...monthlyData.map(m => m.spent), 1);

  const filteredCategories = categoryStats
    .filter(c => c.budget > 0)
    .filter(c => priorityFilter === 'all' ? true : c.priority === priorityFilter)
    .sort((a, b) => {
      // Sort: high → medium → low
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
    });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>

        <ThemedText variant="caption" color={colors.text.muted}>
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </ThemedText>
        <ThemedText variant="title" style={{ marginBottom: spacing.md }}>Budget Tracker</ThemedText>

        {/* View Toggle */}
        <View
          style={[
            styles.toggle,
            { backgroundColor: colors.border },
          ]}
        >
          {(['categories', 'chart'] as const).map(v => (
            <TouchableOpacity
              key={v}
              style={[
                styles.toggleBtn,
                view === v && { backgroundColor: colors.surface, ...shadow.soft },
              ]}
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
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.accentLight },
              ]}
            >
              <View>
                <ThemedText variant="caption" color={colors.accent}>Total Spent This Month</ThemedText>
                <ThemedText variant="title" color={colors.accent}>{fmt(expenses)}</ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 28 }}>📊</Text>
                {prioritySummary.highOver > 0 && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.danger },
                    ]}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                      {prioritySummary.highOver} HIGH ALERT
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 🔴 Priority Alerts */}
            {priorityAlerts.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <ThemedText variant="subtitle" style={{ marginBottom: 8 }}>
                  🚨 Priority Alerts
                </ThemedText>
                {priorityAlerts.map((alert, i) => (
                  <View
                    key={i}
                    style={[
                      styles.alertCard,
                      { backgroundColor: colors.dangerLight, borderLeftColor: colors.danger },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{alert.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <ThemedText variant="label" color={colors.danger}>
                        {alert.category} Over Budget!
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.text.secondary}>
                        Overspent by {fmt(alert.overspent)}
                      </ThemedText>
                    </View>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: colors.danger },
                        ]}
                      >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>HIGH</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 🔄 Budget Shift Notifications */}
            {budgetShifts.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <ThemedText variant="subtitle" style={{ marginBottom: 8 }}>
                  🔄 Auto Budget Shifts
                </ThemedText>
                {budgetShifts.map((shift, i) => (
                  <View
                    key={i}
                    style={[
                      styles.shiftCard,
                      { backgroundColor: colors.warningLight, borderLeftColor: colors.warning },
                    ]}
                  >
                    <Text style={{ fontSize: 22 }}>💸</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <ThemedText variant="label" color={colors.warning}>
                        {fmt(shift.amount)} shifted
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.text.secondary}>
                        From {shift.from} → To {shift.to}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.text.muted}>
                        {shift.reason}
                      </ThemedText>
                    </View>
                  </View>
                ))}

                {/* Total shifted summary */}
                <View
                  style={[
                    styles.shiftTotal,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>💰</Text>
                  <ThemedText variant="label" color={colors.text.secondary} style={{ marginLeft: 8 }}>
                    Total shifted this month:
                  </ThemedText>
                  <ThemedText variant="label" color={colors.warning} style={{ marginLeft: 4 }}>
                    {fmt(prioritySummary.totalShifted)}
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Priority Filter Tabs */}
            <View
              style={[
                styles.priorityFilter,
                { backgroundColor: colors.border },
              ]}
            >
              {(['all', 'high', 'medium', 'low'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityFilterBtn,
                    priorityFilter === p && {
                      backgroundColor: colors.surface,
                      ...shadow.soft,
                    },
                  ]}
                  onPress={() => setPriorityFilter(p)}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700',
                    color: priorityFilter === p
                      ? (p === 'all' ? colors.accent : PRIORITY_CONFIG[p]?.color ?? colors.accent)
                      : colors.text.muted,
                  }}>
                    {p === 'all' ? '🔘 All' : `${PRIORITY_CONFIG[p].icon} ${p.charAt(0).toUpperCase() + p.slice(1)}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Cards */}
            {filteredCategories.map(cat => {
              const pct        = Math.min((cat.spent / cat.budget) * 100, 100);
              const priorityCfg = PRIORITY_CONFIG[cat.priority as keyof typeof PRIORITY_CONFIG];

              return (
                <View key={cat.id} style={[
                  styles.catCard,
                  { backgroundColor: colors.surface },
                  shadow.soft,
                  // Red left border for over-budget high priority
                  cat.priority === 'high' && { borderLeftColor: colors.danger, borderLeftWidth: 3 },
                ]}
              >
                  <View style={styles.catHeader}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ThemedText variant="label">{cat.name}</ThemedText>
                        {/* Priority Badge */}
                        <View
                          style={[
                            styles.priorityPill,
                            { backgroundColor: priorityCfg.bg },
                          ]}
                        >
                          <Text style={{ fontSize: 9, color: priorityCfg.color, fontWeight: '700' }}>
                            {priorityCfg.icon} {cat.priority.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <ThemedText variant="caption" color={colors.text.muted}>
                        {fmt(cat.spent)} of {fmt(cat.budget)}
                      </ThemedText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <ThemedText variant="label" color={cat.over ? colors.danger : colors.success}>
                        {cat.over ? '⚠️ Over!' : fmt(cat.remaining) + ' left'}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.text.muted}>
                        {Math.round(pct)}%
                      </ThemedText>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View
                    style={[
                      styles.progressBg,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <View style={[
                      styles.progressFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: cat.over
                          ? colors.danger
                          : cat.priority === 'high'
                            ? colors.accent
                            : cat.color,
                      },
                    ]}
                    />
                  </View>

                  {/* Shift indicator — shows if budget was shifted TO this category */}
                  {budgetShifts.filter(s => s.to === cat.name).map((shift, i) => (
                    <View
                      key={i}
                      style={[
                        styles.shiftIndicator,
                        { backgroundColor: colors.warningLight },
                      ]}
                    >
                      <Text style={{ fontSize: 11, color: colors.warning }}>
                        💸 +{fmt(shift.amount)} shifted from {shift.from}
                      </Text>
                    </View>
                  ))}
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
            <View
              style={[
                styles.chartCard,
                { backgroundColor: colors.surface },
                shadow.soft,
              ]}
            >
              <View style={styles.barsRow}>
                {monthlyData.map((m, i) => {
                  const h = Math.max((m.spent / maxSpent) * 140, 4);
                  return (
                    <View key={i} style={styles.barWrap}>
                      <ThemedText variant="caption" color={colors.text.muted} style={{ marginBottom: 4, textAlign: 'center' }}>
                        {fmt(m.spent).replace('₹', '₹\n')}
                      </ThemedText>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: h,
                            backgroundColor: colors.accent,
                            opacity: 0.7 + (i / monthlyData.length) * 0.3,
                          },
                        ]}
                      />
                      <ThemedText variant="caption" color={colors.text.muted} style={{ marginTop: 6 }}>
                        {m.label}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Priority Breakdown in Chart view */}
            <ThemedText variant="subtitle" style={{ marginBottom: spacing.sm }}>
              Priority Breakdown
            </ThemedText>
            <View style={{ gap: 10, marginBottom: 16 }}>
              {(['high', 'medium', 'low'] as const).map(p => {
                const cats   = categoryStats.filter(c => c.priority === p && c.budget > 0);
                const total  = cats.reduce((s, c) => s + c.spent, 0);
                const budget = cats.reduce((s, c) => s + c.budget, 0);
                const pct    = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
                const cfg    = PRIORITY_CONFIG[p];
                return (
                  <View
                    key={p}
                    style={[
                      styles.priorityRow,
                      { backgroundColor: colors.surface },
                      shadow.soft,
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 16 }}>{cfg.icon}</Text>
                        <ThemedText variant="label">{cfg.label}</ThemedText>
                      </View>
                      <ThemedText variant="caption" color={colors.text.muted}>
                        {fmt(total)} / {fmt(budget)}
                      </ThemedText>
                    </View>
                      <View
                        style={[
                          styles.progressBg,
                          { backgroundColor: colors.border },
                        ]}
                      >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${pct}%`,
                            backgroundColor: pct >= 100 ? colors.danger : cfg.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Smart Insight */}
            <View
              style={[
                styles.insightCard,
                {
                  backgroundColor: colors.warningLight,
                  borderLeftColor: colors.warning,
                  borderLeftWidth: 4,
                },
              ]}
            >
              <Text style={{ fontSize: 24 }}>💡</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText variant="label" color={colors.warning}>Smart Insight</ThemedText>
                <ThemedText variant="caption" color={colors.text.secondary}>
                  {prioritySummary.highOver > 0
                    ? `${prioritySummary.highOver} high-priority budget(s) exceeded. ₹${prioritySummary.totalShifted.toLocaleString('en-IN')} auto-shifted from low-priority categories.`
                    : expenses > 40000
                      ? "You're spending heavily. Consider reviewing Shopping & Entertainment budgets."
                      : 'Great job! All high-priority budgets are within limits this month.'}
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
  toggle:           { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 16 },
  toggleBtn:        { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  summaryCard:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 16 },
  badge:            { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  alertCard:        { flexDirection: 'row', borderRadius: 12, padding: 14, marginBottom: 8, alignItems: 'center', borderLeftWidth: 4 },
  shiftCard:        { flexDirection: 'row', borderRadius: 12, padding: 14, marginBottom: 8, alignItems: 'center', borderLeftWidth: 4 },
  shiftTotal:       { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, borderWidth: 1 },
  priorityFilter:   { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 16 },
  priorityFilterBtn:{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  catCard:          { borderRadius: 16, padding: 16, marginBottom: 12 },
  catHeader:        { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox:          { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  priorityPill:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  progressBg:       { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill:     { height: 8, borderRadius: 4 },
  shiftIndicator:   { marginTop: 8, borderRadius: 8, padding: 6, alignItems: 'center' },
  chartCard:        { borderRadius: 16, padding: 20, marginBottom: 16 },
  barsRow:          { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 200 },
  barWrap:          { alignItems: 'center', flex: 1 },
  bar:              { width: 28, borderRadius: 6 },
  priorityRow:      { borderRadius: 14, padding: 14 },
  insightCard:      { flexDirection: 'row', borderRadius: 12, padding: 16, alignItems: 'center' },
});