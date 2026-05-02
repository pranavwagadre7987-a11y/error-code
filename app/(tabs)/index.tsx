import { InsightsModal } from '@/components/InsightsModal';
import { ThemedText } from '@/components/themed-text';
import { CATEGORIES, PRIORITY_CONFIG } from '@/constants';
import { useBudget } from '@/hooks/useBudget';
import { useStatementImport } from '@/hooks/useStatementImport';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colors, spacing, shadow } = useTheme();
  const { transactions, deleteTransaction, income, expenses, balance, profile, loaded, priorityAlerts, budgetShifts, addTransaction } = useBudget();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  const statementImport = useStatementImport(
    () => {
      // Refresh after import
      setFilter('all');
    },
    addTransaction
  );

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
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>↓ Expenses</Text>
              <ThemedText variant="subtitle" color="#fff">{fmt(expenses)}</ThemedText>
            </View>
          </View>
        </View>

        {/* 🔴 Priority Alerts Banner */}
        {priorityAlerts.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            {priorityAlerts.map((alert, i) => (
              <View key={i} style={[styles.alertCard, {
                backgroundColor: colors.dangerLight,
                borderLeftColor: colors.danger,
              }]}>
                <Text style={{ fontSize: 22 }}>{alert.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <ThemedText variant="label" color={colors.danger}>
                    {alert.category} Over Budget!
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.text.secondary}>
                    Overspent by {fmt(alert.overspent)}
                  </ThemedText>
                </View>
                <View style={[styles.priorityTag, { backgroundColor: colors.danger }]}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>HIGH</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 🔄 Budget Shift Notifications */}
        {budgetShifts.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            {budgetShifts.map((shift, i) => (
              <View key={i} style={[styles.shiftCard, {
                backgroundColor: colors.warningLight,
                borderLeftColor: colors.warning,
              }]}>
                <Text style={{ fontSize: 20 }}>💸</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <ThemedText variant="label" color={colors.warning}>
                    Auto Budget Shift
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.text.secondary}>
                    {fmt(shift.amount)} moved: {shift.from} → {shift.to}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}

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

        {/* Import Statement Button */}
        <TouchableOpacity
          style={[
            styles.importButton,
            { backgroundColor: colors.accent, marginBottom: spacing.md },
            shadow.soft,
          ]}
          onPress={statementImport.pickPDFFile}
          disabled={statementImport.isLoading}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>📄</Text>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
            {statementImport.isLoading ? 'Reading PDF...' : 'Import Statement'}
          </Text>
        </TouchableOpacity>

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
              const priorityCfg = cat?.priority ? PRIORITY_CONFIG[cat.priority as keyof typeof PRIORITY_CONFIG] : null;
              return (
                <View key={tx.id}>
                  <View style={styles.txRow}>
                    <View style={[styles.txIcon, { backgroundColor: colors.background }]}>
                      <Text style={{ fontSize: 20 }}>{cat?.icon ?? '📦'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.txTitleRow}>
                        <ThemedText variant="label">{tx.title}</ThemedText>
                        {/* Priority dot on transaction */}
                        {priorityCfg && (
                          <Text style={{ fontSize: 10, marginLeft: 6 }}>{priorityCfg.icon}</Text>
                        )}
                      </View>
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

      {/* Insights Modal */}
      <Modal
        visible={statementImport.transactions.length > 0}
        transparent
        animationType="slide"
        onRequestClose={() => statementImport.clearState()}
      >
        <InsightsModal
          transactions={statementImport.transactions}
          onClose={() => statementImport.clearState()}
          onImport={statementImport.importTransactions}
          isImporting={statementImport.isImporting}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  hero:        { borderRadius: 20, padding: 24, marginBottom: 16 },
  heroRow:     { flexDirection: 'row', marginTop: 16, gap: 24 },
  heroStat:    { gap: 4 },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  filterRow:   { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 16 },
  filterBtn:   { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  importButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  emptyBox:    { borderRadius: 16, padding: 40, alignItems: 'center' },
  card:        { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  txRow:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  txTitleRow:  { flexDirection: 'row', alignItems: 'center' },
  txIcon:      { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtn:   { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sep:         { height: 1, marginHorizontal: 14 },
  alertCard:   { flexDirection: 'row', borderRadius: 12, padding: 14, marginBottom: 8, alignItems: 'center', borderLeftWidth: 4 },
  shiftCard:   { flexDirection: 'row', borderRadius: 12, padding: 14, marginBottom: 8, alignItems: 'center', borderLeftWidth: 4 },
  priorityTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
});