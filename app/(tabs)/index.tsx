import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useBudget } from '@/hooks/useBudget';
import { ThemedText } from '@/components/themed-text';
import { CATEGORIES } from '@/constants';

export default function HomeScreen() {
  const { colors, spacing, shadow } = useTheme();
  const { transactions, deleteTransaction, income, expenses, balance, profile, loaded } = useBudget();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const fmt = (n: number) => profile.currency + Math.abs(n).toLocaleString('en-IN');

  const getCat = (id: string) => CATEGORIES.find(c => c.id === id);

  const filtered = transactions.filter(t =>
    filter === 'all' ? true : filter === 'income' ? t.amount > 0 : t.amount < 0
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Transaction', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  };

  if (!loaded) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText>Loading...</ThemedText>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>

        {/* Header */}
        <View style={styles.row}>
          <View>
            <ThemedText variant="caption" color={colors.text.muted}>
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </ThemedText>
            <ThemedText variant="title">Hello, {profile.name} 👋</ThemedText>
          </View>
        </View>

        {/* Balance Hero */}
        <View style={[styles.hero, { backgroundColor: colors.accent }, shadow.card]}>
          <ThemedText variant="caption" color="rgba(255,255,255,0.7)">Total Balance</ThemedText>
          <ThemedText variant="display" color="#fff" style={{ marginVertical: 6 }}>
            {balance >= 0 ? '' : '-'}{fmt(balance)}
          </ThemedText>
          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>↑ Income</Text>
              <ThemedText variant="subtitle" color="#fff">{fmt(income)}</ThemedText>
            </View>
            <View style={[styles.heroDivider]} />
            <View style={styles.heroStat}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>↓ Expenses</Text>
              <ThemedText variant="subtitle" color="#fff">{fmt(expenses)}</ThemedText>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={[styles.filterRow, { backgroundColor: colors.border }]}>
          {(['all', 'income', 'expense'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && { backgroundColor: colors.surface, ...shadow.soft }]}
              onPress={() => setFilter(f)}
            >
              <Text style={{
                color: filter === f ? colors.accent : colors.text.muted,
                fontWeight: '600', fontSize: 13, textTransform: 'capitalize',
              }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        <ThemedText variant="subtitle" style={{ marginBottom: spacing.sm }}>
          Transactions ({filtered.length})
        </ThemedText>

        {filtered.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface }, shadow.soft]}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <ThemedText variant="body" color={colors.text.muted} style={{ marginTop: 8 }}>
              No transactions yet
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface }, shadow.soft]}>
            {filtered.map((tx, i) => {
              const cat = getCat(tx.categoryId);
              return (
                <View key={tx.id}>
                  <View style={styles.txRow}>
                    <View style={[styles.txIcon, { backgroundColor: colors.background }]}>
                      <Text style={{ fontSize: 20 }}>{cat?.icon ?? '📦'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <ThemedText variant="label">{tx.title}</ThemedText>
                      <ThemedText variant="caption" color={colors.text.muted}>
                        {formatDate(tx.date)} · {cat?.name}
                      </ThemedText>
                    </View>
                    <ThemedText variant="label" color={tx.amount > 0 ? colors.success : colors.text.primary}>
                      {tx.amount > 0 ? '+' : '-'}{fmt(tx.amount)}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => handleDelete(tx.id, tx.title)}
                      style={[styles.deleteBtn, { backgroundColor: colors.dangerLight }]}
                    >
                      <Text style={{ fontSize: 12 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                  {i < filtered.length - 1 && <View style={[styles.sep, { backgroundColor: colors.border }]} />}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  hero:       { borderRadius: 20, padding: 24, marginBottom: 16 },
  heroRow:    { flexDirection: 'row', marginTop: 16, gap: 24 },
  heroStat:   { gap: 4 },
  heroDivider:{ width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  filterRow:  { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 16 },
  filterBtn:  { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  emptyBox:   { borderRadius: 16, padding: 40, alignItems: 'center' },
  card:       { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  txRow:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  txIcon:     { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtn:  { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sep:        { height: 1, marginHorizontal: 14 },
});