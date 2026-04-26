import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Text, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useBudget } from '@/hooks/useBudget';
import { ThemedText } from '@/components/themed-text';
import { CATEGORIES } from '@/constants';

export default function AddTransactionModal() {
  const { colors, spacing, shadow } = useTheme();
  const { addTransaction } = useBudget();

  const [amount, setAmount]         = useState('');
  const [title, setTitle]           = useState('');
  const [selectedCat, setSelectedCat] = useState('2');
  const [type, setType]             = useState<'expense' | 'income'>('expense');
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a description.');
      return;
    }
    setSaving(true);
    await addTransaction({
      title: title.trim(),
      amount: type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
      categoryId: type === 'income' ? '7' : selectedCat,
      date: new Date().toISOString(),
    });
    setSaving(false);
    router.back();
  };

  const displayCats = CATEGORIES.filter(c => type === 'income' ? c.id === '7' : c.id !== '7');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: colors.border }]}>
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
                style={[styles.toggleBtn, type === t && { backgroundColor: colors.surface, ...shadow.soft }]}
                onPress={() => { setType(t); setSelectedCat(t === 'income' ? '7' : '2'); }}
              >
                <Text style={{
                  color: type === t ? (t === 'expense' ? colors.danger : colors.success) : colors.text.muted,
                  fontWeight: '700', fontSize: 14,
                }}>
                  {t === 'expense' ? '↓ Expense' : '↑ Income'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Input */}
          <View style={[styles.amountBox, { borderColor: type === 'expense' ? colors.danger : colors.success, backgroundColor: colors.surface }]}>
            <Text style={{ fontSize: 28, color: colors.text.muted }}>₹</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              style={{ flex: 1, fontSize: 32, fontWeight: '700', color: colors.text.primary, marginLeft: 8 }}
              placeholderTextColor={colors.text.muted}
            />
          </View>

          {/* Description Input */}
          <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
              <ThemedText variant="label" color={colors.text.muted} style={{ marginBottom: spacing.sm }}>
                Category
              </ThemedText>
              <View style={styles.catGrid}>
                {displayCats.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: selectedCat === cat.id ? colors.accent : colors.surface,
                        borderColor: selectedCat === cat.id ? colors.accent : colors.border,
                        ...shadow.soft,
                      },
                    ]}
                    onPress={() => setSelectedCat(cat.id)}
                  >
                    <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                    <Text style={{
                      fontSize: 11, marginTop: 4, fontWeight: '600',
                      color: selectedCat === cat.id ? '#fff' : colors.text.secondary,
                    }}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: saving ? colors.text.muted : colors.accent }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>
              {saving ? 'Saving...' : '✓ Save Transaction'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  closeBtn:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toggle:    { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  amountBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 14, padding: 16, marginBottom: 16 },
  inputBox:  { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 20 },
  catGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catChip:   { width: '22%', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
  saveBtn:   { padding: 18, borderRadius: 14, alignItems: 'center' },
});