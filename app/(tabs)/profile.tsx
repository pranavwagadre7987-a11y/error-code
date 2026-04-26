import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity,
  Text, TextInput, Alert, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useBudget } from '@/hooks/useBudget';
import { ThemedText } from '@/components/themed-text';

export default function ProfileScreen() {
  const { colors, spacing, shadow } = useTheme();
  const { profile, updateProfile, resetData, income, expenses, transactions } = useBudget();
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(profile.name);
  const [email, setEmail]       = useState(profile.email);
  const [monthlyIncome, setMonthlyIncome] = useState(String(profile.monthlyIncome));
  const [notifications, setNotifications] = useState(true);

  const fmt = (n: number) => profile.currency + n.toLocaleString('en-IN');

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    await updateProfile({ ...profile, name: name.trim(), email: email.trim(), monthlyIncome: Number(monthlyIncome) || profile.monthlyIncome });
    setEditing(false);
    Alert.alert('✅ Saved', 'Profile updated successfully!');
  };

  const handleReset = () => {
    Alert.alert('Reset Data', 'This will delete all your transactions and restore sample data. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => { await resetData(); Alert.alert('✅ Done', 'Data has been reset.'); } },
    ]);
  };

  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}>

        <ThemedText variant="title" style={{ marginBottom: spacing.lg }}>Profile & Settings</ThemedText>

        {/* Avatar + Name Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.accent }, shadow.card]}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 36 }}>{profile.avatar}</Text>
          </View>
          <ThemedText variant="title" color="#fff" style={{ marginTop: 12 }}>{profile.name}</ThemedText>
          <ThemedText variant="caption" color="rgba(255,255,255,0.7)">{profile.email}</ThemedText>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => setEditing(!editing)}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>{editing ? 'Cancel' : '✏️ Edit Profile'}</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Form */}
        {editing && (
          <View style={[styles.card, { backgroundColor: colors.surface }, shadow.soft]}>
            <ThemedText variant="subtitle" style={{ marginBottom: 16 }}>Edit Details</ThemedText>
            {[
              { label: 'Name', value: name, setter: setName, keyboard: 'default' as const },
              { label: 'Email', value: email, setter: setEmail, keyboard: 'email-address' as const },
              { label: 'Monthly Income (₹)', value: monthlyIncome, setter: setMonthlyIncome, keyboard: 'numeric' as const },
            ].map(field => (
              <View key={field.label} style={[styles.inputBox, { borderColor: colors.border }]}>
                <ThemedText variant="caption" color={colors.text.muted}>{field.label}</ThemedText>
                <TextInput
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={field.keyboard}
                  style={{ fontSize: 16, color: colors.text.primary, marginTop: 4 }}
                />
              </View>
            ))}
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>✓ Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Summary */}
        <ThemedText variant="subtitle" style={{ marginBottom: spacing.sm }}>Your Stats</ThemedText>
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Income',       value: fmt(income),       icon: '↑', color: colors.successLight,  text: colors.success  },
            { label: 'Total Expenses',     value: fmt(expenses),     icon: '↓', color: colors.dangerLight,   text: colors.danger   },
            { label: 'Transactions',       value: String(transactions.length), icon: '📋', color: colors.accentLight, text: colors.accent },
            { label: 'Savings Rate',       value: savingsRate + '%', icon: '💰', color: colors.warningLight, text: colors.warning  },
          ].map(stat => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: stat.color }, shadow.soft]}>
              <Text style={{ fontSize: 22 }}>{stat.icon}</Text>
              <ThemedText variant="title" color={stat.text}>{stat.value}</ThemedText>
              <ThemedText variant="caption" color={colors.text.muted}>{stat.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Settings Toggles */}
        <ThemedText variant="subtitle" style={{ marginBottom: spacing.sm }}>Settings</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.surface }, shadow.soft]}>
          <View style={styles.settingRow}>
            <View>
              <ThemedText variant="label">Notifications</ThemedText>
              <ThemedText variant="caption" color={colors.text.muted}>Budget alerts & reminders</ThemedText>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.accentLight }}
              thumbColor={notifications ? colors.accent : colors.text.muted}
            />
          </View>
          <View style={[styles.sep, { backgroundColor: colors.border }]} />
          <View style={styles.settingRow}>
            <View>
              <ThemedText variant="label">Currency</ThemedText>
              <ThemedText variant="caption" color={colors.text.muted}>Indian Rupee (₹)</ThemedText>
            </View>
            <Text style={{ fontSize: 20 }}>🇮🇳</Text>
          </View>
        </View>

        {/* Danger Zone */}
        <ThemedText variant="subtitle" style={{ marginBottom: spacing.sm }}>Data</ThemedText>
        <View style={[styles.card, { backgroundColor: colors.surface }, shadow.soft]}>
          <TouchableOpacity style={[styles.dangerBtn, { backgroundColor: colors.dangerLight }]} onPress={handleReset}>
            <Text style={{ fontSize: 18 }}>🔄</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText variant="label" color={colors.danger}>Reset All Data</ThemedText>
              <ThemedText variant="caption" color={colors.text.muted}>Restore sample transactions</ThemedText>
            </View>
            <Text style={{ color: colors.danger }}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
  avatarCircle:{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  editBtn:     { marginTop: 14, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  card:        { borderRadius: 16, padding: 16, marginBottom: 16 },
  inputBox:    { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  saveBtn:     { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  statsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard:    { width: '47%', borderRadius: 14, padding: 16, gap: 4 },
  settingRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  sep:         { height: 1, marginVertical: 12 },
  dangerBtn:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14 },
});