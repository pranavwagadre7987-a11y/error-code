import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Text
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/themed-text';
import { BUDGET_CATEGORIES } from '@/constants';

export default function AddTransactionModal() {
  const { colors, spacing, radius, shadow } = useTheme();
  const [amount, setAmount]       = useState('');
  const [title, setTitle]         = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [type, setType]           = useState<'expense' | 'income'>('expense');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Handle bar */}
      <View style={[styles.handle, { backgroundColor: colors.border }]} />

      <ThemedText variant="title" style={{ marginBottom: spacing.lg }}>
        Add Transaction
      </ThemedText>

      {/* Type toggle */}
      <View style={[styles.toggle, { backgroundColor: colors.border }]}>
        {(['expense', 'income'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[
              styles.toggleBtn,
              type === t && { backgroundColor: colors.surface, ...shadow.soft },
            ]}
            onPress={() => setType(t)}
          >
            <Text style={{
              color: type === t
                ? (t === 'expense' ? colors.danger : colors.success)
                : colors.text.muted,
              fontWeight: '600',
              textTransform: 'capitalize',
            }}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount */}
      <View style={[styles.inputWrap, { borderColor: colors.border }]}>
        <ThemedText variant="label" color={colors.text.muted} style={{ marginBottom: 4 }}>
          Amount (₹)
        </ThemedText>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={[styles.input, { color: colors.text.primary, fontSize: 28, fontWeight: '700' }]}
          placeholderTextColor={colors.text.muted}
        />
      </View>

      {/* Title */}
      <View style={[styles.inputWrap, { borderColor: colors.border }]}>
        <ThemedText variant="label" color={colors.text.muted} style={{ marginBottom: 4 }}>
          Description
        </ThemedText>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What was this for?"
          style={[styles.input, { color: colors.text.primary }]}
          placeholderTextColor={colors.text.muted}
        />
      </View>

      {/* Category */}
      <ThemedText variant="label" color={colors.text.muted} style={{ marginBottom: spacing.sm }}>
        Category
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        {BUDGET_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.catChip,
              {
                backgroundColor: selectedCat === cat.id ? colors.accent : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedCat(cat.id)}
          >
            <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
            <Text style={{
              fontSize: 12,
              color: selectedCat === cat.id ? '#fff' : colors.text.secondary,
              marginTop: 4,
            }}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.accent }]}
        onPress={() => router.back()}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
          Save Transaction
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 12 },
  handle:    { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  toggle:    { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  inputWrap: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 },
  input:     { fontSize: 16 },
  catChip:   {
    alignItems: 'center', padding: 12, borderRadius: 12,
    borderWidth: 1, marginRight: 10, minWidth: 70,
  },
  submitBtn: {
    padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 8,
  },
});