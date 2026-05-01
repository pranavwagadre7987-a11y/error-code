import { ThemedText } from '@/components/themed-text';
import { CATEGORIES, PRIORITY_CONFIG } from '@/constants';
import { useBudget } from '@/hooks/useBudget';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert, KeyboardAvoidingView, Modal, Platform,
    ScrollView, StyleSheet, Text, TextInput,
    TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BudgetTransfer = {
  fromCategoryId: string;
  toCategoryId: string;
  amount: number;
};

export default function AddTransactionModal() {
  const { colors, spacing, shadow } = useTheme();
  const { addTransaction, categoryStats, transferBudget, getEffectiveBudget } = useBudget();

  const [amount, setAmount]           = useState('');
  const [title, setTitle]             = useState('');
  const [selectedCat, setSelectedCat] = useState('2');
  const [type, setType]               = useState<'expense' | 'income'>('expense');
  const [saving, setSaving]           = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSelections, setTransferSelections] = useState<Record<string, number>>({});
  const [pendingOverBudgetCategory, setPendingOverBudgetCategory] = useState<string | null>(null);
  const [pendingOverBudgetAmount, setPendingOverBudgetAmount] = useState(0);

  // ── Core save function ──────────────────────────────────────
  const doSave = async () => {
    setSaving(true);
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid amount');
      }

      const categoryId = type === 'income' ? '7' : selectedCat;
      const selectedCategory = CATEGORIES.find(c => c.id === categoryId);
      if (!selectedCategory) {
        throw new Error('Invalid category selected');
      }

      console.log('Saving transaction:', {
        category: selectedCategory.name,
        categoryId,
        amount: parsedAmount,
        type,
      });

      await addTransaction({
        title:      title.trim(),
        amount:     type === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
        categoryId,
        date:       new Date().toISOString(),
      });

      return true;
    } catch (e) {
      console.error('Save failed:', e);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── Validate then save or show transfer popup ───────────────
  const handleSave = async () => {
    try {
      const parsedAmount = parseFloat(amount);
      const selectedCategory = CATEGORIES.find(c => c.id === (type === 'income' ? '7' : selectedCat));

      if (!selectedCategory || !selectedCat) {
        Alert.alert('Error', 'Please select a valid category.');
        return;
      }
      if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount.');
        return;
      }
      if (!title.trim()) {
        Alert.alert('Missing Title', 'Please add a description.');
        return;
      }

      const selectedCatStat = categoryStats.find(c => c.id === selectedCategory.id);
      const effectiveBudget = getEffectiveBudget(selectedCategory.id);
      const projectedSpent = (selectedCatStat?.spent ?? 0) + (type === 'expense' ? parsedAmount : 0);
      const shouldShowTransferModal =
        type === 'expense' &&
        selectedCategory.priority === 'high' &&
        effectiveBudget > 0 &&
        projectedSpent > effectiveBudget;

      const saved = await doSave();
      console.log('handleSave result', { saved, shouldShowTransferModal, category: selectedCategory.name, projectedSpent, effectiveBudget });
      if (!saved) return;

      if (shouldShowTransferModal) {
        setPendingOverBudgetCategory(selectedCategory.id);
        setPendingOverBudgetAmount(Math.max(projectedSpent - effectiveBudget, 0));
        setTransferSelections({});
        setShowTransferModal(true);
        return;
      }

      router.dismiss();
    } catch (error) {
      console.error('Transaction save flow failed:', error);
      Alert.alert('Error', 'Unable to save transaction. Please try again.');
    }
  };

  // ── Transfer budget then save ───────────────────────────────
  const handleTransferAndSave = async () => {
    const targetCategoryId = pendingOverBudgetCategory ?? selectedCat;
    const transfers: BudgetTransfer[] = Object.entries(transferSelections)
      .filter(([_, amt]) => amt > 0)
      .map(([fromId, amt]) => ({
        fromCategoryId: fromId,
        toCategoryId:   targetCategoryId,
        amount:         amt,
      }));

    if (transfers.length > 0) {
      const success = await transferBudget(transfers);
      if (!success) {
        Alert.alert('Error', 'Failed to transfer budget. Please try again.');
        return;
      }
    }

    console.log('Budget transfer completed:', {
      targetCategoryId,
      transfers,
    });

    setPendingOverBudgetCategory(null);
    setPendingOverBudgetAmount(0);
    setShowTransferModal(false);
    Alert.alert('Budget transferred successfully');
    router.dismiss();
  };

  // ── Category display ────────────────────────────────────────
  const displayCats = CATEGORIES.filter(c =>
    type === 'income' ? c.id === '7' : c.id !== '7'
  );

  const sortedCats = [...displayCats].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
  });

  const selectedCatData  = CATEGORIES.find(c => c.id === selectedCat);
  const selectedCatStat  = categoryStats.find(c => c.id === selectedCat);
  const selectedPriority = selectedCatData?.priority ?? 'low';
  const priorityCfg      = PRIORITY_CONFIG[selectedPriority as keyof typeof PRIORITY_CONFIG];

  const lowCatsWithBudget = categoryStats.filter(
    c => c.priority === 'low' && c.remaining > 0
  );

  const totalTransferring = Object.values(transferSelections).reduce((s, v) => s + v, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push('/')}
              style={[styles.closeBtn, { backgroundColor: colors.border }]}
            >
              <Text style={{ fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            <ThemedText variant="title">Add Transaction</ThemedText>
            <View style={{ width: 36 }} />
          </View>

          {/* Type Toggle */}
          <View style={[styles.toggle, { backgroundColor: colors.border }]}>
            {(['expense', 'income'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.toggleBtn,
                  type === t && { backgroundColor: colors.surface, ...shadow.soft },
                ]}
                onPress={() => { setType(t); setSelectedCat(t === 'income' ? '7' : '2'); }}
              >
                <Text style={{
                  color: type === t
                    ? (t === 'expense' ? colors.danger : colors.success)
                    : colors.text.muted,
                  fontWeight: '700', fontSize: 14,
                }}>
                  {t === 'expense' ? '↓ Expense' : '↑ Income'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Input */}
          <View style={[styles.amountBox, {
            borderColor: type === 'expense' ? colors.danger : colors.success,
            backgroundColor: colors.surface,
          }]}>
            <Text style={{ fontSize: 28, color: colors.text.muted }}>₹</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              style={{
                flex: 1, fontSize: 32, fontWeight: '700',
                color: colors.text.primary, marginLeft: 8,
              }}
              placeholderTextColor={colors.text.muted}
            />
          </View>

          {/* Description Input */}
          <View style={[styles.inputBox, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }]}>
            <ThemedText variant="caption" color={colors.text.muted}>Description</ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What was this for?"
              style={{ fontSize: 16, color: colors.text.primary, marginTop: 4 }}
              placeholderTextColor={colors.text.muted}
            />
          </View>

          {/* Category Selector */}
          {type === 'expense' && (
            <>
              <View style={styles.catLabelRow}>
                <ThemedText variant="label" color={colors.text.muted}>Category</ThemedText>
                {priorityCfg && (
                  <View style={[styles.priorityBadge, { backgroundColor: priorityCfg.bg }]}>
                    <Text style={{ fontSize: 11, color: priorityCfg.color, fontWeight: '700' }}>
                      {priorityCfg.icon} {selectedPriority.toUpperCase()} PRIORITY
                    </Text>
                  </View>
                )}
              </View>

              {/* Budget status bar */}
              {selectedCatStat && selectedCatStat.budget > 0 && (
                <View style={[styles.budgetStatus, {
                  backgroundColor: selectedCatStat.over
                    ? colors.dangerLight : colors.accentLight,
                  borderColor: selectedCatStat.over
                    ? colors.danger : colors.accent,
                }]}>
                  <Text style={{ fontSize: 14 }}>
                    {selectedCatStat.over ? '⚠️' : '✅'}
                  </Text>
                  <ThemedText
                    variant="caption"
                    color={selectedCatStat.over ? colors.danger : colors.accent}
                    style={{ marginLeft: 8 }}
                  >
                    {selectedCatStat.over
                      ? `Over budget by ₹${(selectedCatStat.spent - selectedCatStat.budget).toLocaleString('en-IN')}`
                      : `₹${selectedCatStat.remaining.toLocaleString('en-IN')} remaining`}
                  </ThemedText>
                </View>
              )}

              {/* Category Grid */}
              <View style={styles.catGrid}>
                {sortedCats.map(cat => {
                  const cfg     = PRIORITY_CONFIG[cat.priority as keyof typeof PRIORITY_CONFIG];
                  const cStat   = categoryStats.find(c => c.id === cat.id);
                  const isOver  = cStat?.over ?? false;
                  const sel     = selectedCat === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor: sel ? colors.accent : colors.surface,
                          borderColor: sel
                            ? colors.accent
                            : isOver ? colors.danger : cfg.color,
                          borderWidth: 1.5,
                        },
                        shadow.soft,
                      ]}
                      onPress={() => setSelectedCat(cat.id)}
                    >
                      <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                      <Text style={{
                        fontSize: 11, marginTop: 4, fontWeight: '600',
                        color: sel ? '#fff' : colors.text.secondary,
                      }}>
                        {cat.name}
                      </Text>
                      <Text style={{ fontSize: 9, marginTop: 2 }}>{cfg.icon}</Text>
                      {isOver && !sel && (
                        <View style={[styles.overDot, { backgroundColor: colors.danger }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Priority Legend */}
              <View style={[styles.legend, {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }]}>
                <ThemedText variant="caption" color={colors.text.muted} style={{ marginBottom: 6 }}>
                  Priority Legend
                </ThemedText>
                <View style={styles.legendRow}>
                  {(['high', 'medium', 'low'] as const).map(p => (
                    <View key={p} style={styles.legendItem}>
                      <Text style={{ fontSize: 12 }}>{PRIORITY_CONFIG[p].icon}</Text>
                      <Text style={{
                        fontSize: 11, color: PRIORITY_CONFIG[p].color,
                        fontWeight: '600', marginLeft: 4,
                      }}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ✅ Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, {
              backgroundColor: saving ? colors.text.muted : colors.accent,
            }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>
              {saving ? 'Saving...' : '✓ Save Transaction'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ✅ Budget Transfer Popup Modal */}
      <Modal
        visible={showTransferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTransferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.transferModal, { backgroundColor: colors.surface }]}>

            {/* Modal Header */}
            <View style={styles.transferHeader}>
              <Text style={{ fontSize: 28 }}>⚠️</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText variant="subtitle" color={colors.danger}>
                  Over Budget!
                </ThemedText>
                <ThemedText variant="caption" color={colors.text.muted}>
                  Transfer from low priority categories
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => setShowTransferModal(false)}
                style={{ padding: 4 }}
              >
                <Text style={{ fontSize: 20, color: colors.text.muted }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Over budget info */}
            {(() => {
              const cStat = pendingOverBudgetCategory
                ? categoryStats.find(c => c.id === pendingOverBudgetCategory)
                : categoryStats.find(c => c.id === selectedCat);
              const overBy = cStat ? Math.max(cStat.spent - cStat.budget, 0) : pendingOverBudgetAmount;
              return (
                <View style={[styles.overAlert, { backgroundColor: colors.dangerLight }]}> 
                  <ThemedText variant="label" color={colors.danger}>
                    {cStat?.name ?? 'Category'} is over by ₹{overBy.toLocaleString('en-IN')}
                    Pick categories below to transfer budget from:
                  </ThemedText>
                </View>
              );
            })()}

            {/* Low priority category list */}
            <ScrollView style={{ maxHeight: 260 }} nestedScrollEnabled>
              {lowCatsWithBudget.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 32 }}>😔</Text>
                  <ThemedText
                    variant="caption"
                    color={colors.text.muted}
                    style={{ marginTop: 8, textAlign: 'center' }}
                  >
                    No low priority categories have remaining budget.
                  </ThemedText>
                </View>
              ) : (
                lowCatsWithBudget.map(lowCat => {
                  const sel = transferSelections[lowCat.id] ?? 0;
                  return (
                    <View
                      key={lowCat.id}
                      style={[
                        styles.transferRow,
                        {
                          borderColor: sel > 0 ? colors.accent : colors.border,
                          backgroundColor: sel > 0 ? colors.accentLight : colors.background,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 24 }}>{lowCat.icon}</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <ThemedText variant="label">{lowCat.name}</ThemedText>
                        <ThemedText variant="caption" color={colors.text.muted}>
                          ₹{lowCat.remaining.toLocaleString('en-IN')} available
                        </ThemedText>
                      </View>
                      <View style={styles.transferControls}>
                        <TouchableOpacity
                          style={[styles.transferBtn, { backgroundColor: colors.border }]}
                          onPress={() => setTransferSelections(prev => ({
                            ...prev,
                            [lowCat.id]: Math.max((prev[lowCat.id] ?? 0) - 500, 0),
                          }))}
                        >
                          <Text style={{ fontWeight: '700', fontSize: 18 }}>−</Text>
                        </TouchableOpacity>
                        <Text style={{
                          marginHorizontal: 8, minWidth: 64,
                          textAlign: 'center', fontWeight: '700',
                          fontSize: 13, color: colors.text.primary,
                        }}>
                          ₹{sel.toLocaleString('en-IN')}
                        </Text>
                        <TouchableOpacity
                          style={[styles.transferBtn, { backgroundColor: colors.accentLight }]}
                          onPress={() => setTransferSelections(prev => ({
                            ...prev,
                            [lowCat.id]: Math.min(
                              (prev[lowCat.id] ?? 0) + 500,
                              lowCat.remaining
                            ),
                          }))}
                        >
                          <Text style={{ fontWeight: '700', fontSize: 18, color: colors.accent }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* Total transferring */}
            {totalTransferring > 0 && (
              <View style={[styles.transferSummary, { backgroundColor: colors.accentLight }]}>
                <Text style={{ fontSize: 16 }}>💸</Text>
                <ThemedText variant="label" color={colors.accent} style={{ marginLeft: 8 }}>
                  Total transferring: ₹{totalTransferring.toLocaleString('en-IN')}
                </ThemedText>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.transferActions}>
              {/* Skip — save without transfer */}
              <TouchableOpacity
                style={[styles.skipBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setPendingOverBudgetCategory(null);
                  setPendingOverBudgetAmount(0);
                  setShowTransferModal(false);
                  router.dismiss();
                }}
              >
                <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>
                  Skip & Add
                </Text>
              </TouchableOpacity>

              {/* Transfer & Save */}
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: totalTransferring > 0
                      ? colors.accent : colors.text.muted,
                  },
                ]}
                onPress={handleTransferAndSave}
                disabled={totalTransferring === 0}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  💸 Transfer & Add
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  closeBtn:        { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toggle:          { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn:       { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  amountBox:       { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 14, padding: 16, marginBottom: 16 },
  inputBox:        { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 20 },
  catLabelRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  priorityBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  budgetStatus:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 12 },
  catGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  catChip:         { width: '22%', alignItems: 'center', padding: 12, borderRadius: 12, position: 'relative' },
  overDot:         { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4 },
  legend:          { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 20 },
  legendRow:       { flexDirection: 'row', gap: 16 },
  legendItem:      { flexDirection: 'row', alignItems: 'center' },
  saveBtn:         { padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  transferModal:   { borderRadius: 20, padding: 20, width: '92%', maxHeight: '85%' },
  transferHeader:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  overAlert:       { borderRadius: 12, padding: 14, marginBottom: 16 },
  transferRow:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, padding: 14, marginBottom: 8 },
  transferControls:{ flexDirection: 'row', alignItems: 'center' },
  transferBtn:     { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  transferSummary: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, marginTop: 8 },
  transferActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  skipBtn:         { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  confirmBtn:      { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
});