import { Colors, Radius, Spacing } from '@/constants';
import type { ParsedTransaction } from '@/utils/parsePDF';
import { useMemo } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface InsightsModalProps {
  transactions: ParsedTransaction[];
  onClose: () => void;
  onImport: (transactions: ParsedTransaction[]) => void;
  isImporting?: boolean;
}

export function InsightsModal({
  transactions,
  onClose,
  onImport,
  isImporting = false,
}: InsightsModalProps) {
  // Calculate summary stats
  const stats = useMemo(() => {
    const credited = transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const debited = transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const net = credited - debited;

    return {
      credited,
      debited,
      net,
      count: transactions.length,
      isPositive: net >= 0,
    };
  }, [transactions]);

  // Time slot grouping
  const timeSlots = useMemo(() => {
    const slots = {
      'midnight': { label: '12am–6am', credit: 0, debit: 0 },
      'morning': { label: '6am–12pm', credit: 0, debit: 0 },
      'afternoon': { label: '12pm–6pm', credit: 0, debit: 0 },
      'evening': { label: '6pm–12am', credit: 0, debit: 0 },
    };

    transactions.forEach(t => {
      const hour = t.hour;
      let slot = 'afternoon';

      if (hour >= 0 && hour < 6) slot = 'midnight';
      else if (hour >= 6 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 18) slot = 'afternoon';
      else slot = 'evening';

      if (t.type === 'CREDIT') {
        slots[slot as keyof typeof slots].credit += t.amount;
      } else {
        slots[slot as keyof typeof slots].debit += t.amount;
      }
    });

    return Object.entries(slots).map(([key, value]) => ({
      key,
      ...value,
    }));
  }, [transactions]);

  // Daily grouping
  const dailyFlow = useMemo(() => {
    const grouped: Record<string, { credit: number; debit: number }> = {};

    transactions.forEach(t => {
      if (!grouped[t.date]) {
        grouped[t.date] = { credit: 0, debit: 0 };
      }
      if (t.type === 'CREDIT') {
        grouped[t.date].credit += t.amount;
      } else {
        grouped[t.date].debit += t.amount;
      }
    });

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => {
        const dA = new Date(dateA);
        const dB = new Date(dateB);
        return dB.getTime() - dA.getTime();
      })
      .map(([date, flow]) => ({ date, ...flow }));
  }, [transactions]);

  // Debit transactions (transfers)
  const debitTransactions = useMemo(
    () => transactions.filter(t => t.type === 'DEBIT'),
    [transactions]
  );

  // Credit transactions
  const creditTransactions = useMemo(
    () => transactions.filter(t => t.type === 'CREDIT'),
    [transactions]
  );

  const handleImport = async () => {
    Alert.alert(
      'Import Transactions',
      `Import ${transactions.length} transactions into your app?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Import',
          onPress: async () => {
            onImport(transactions);
          },
          style: 'default',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Statement Insights</Text>
        <TouchableOpacity onPress={onClose} disabled={isImporting}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.cardsRow}>
            <SummaryCard
              label="Credited"
              value={`₹${stats.credited.toLocaleString('en-IN')}`}
              color={Colors.success}
              bgColor={Colors.successLight}
            />
            <SummaryCard
              label="Debited"
              value={`₹${stats.debited.toLocaleString('en-IN')}`}
              color={Colors.danger}
              bgColor={Colors.dangerLight}
            />
          </View>

          <View style={styles.cardsRow}>
            <SummaryCard
              label="Net"
              value={`₹${Math.abs(stats.net).toLocaleString('en-IN')}`}
              color={stats.isPositive ? Colors.success : Colors.danger}
              bgColor={stats.isPositive ? Colors.successLight : Colors.dangerLight}
            />
            <SummaryCard
              label="Count"
              value={`${stats.count}`}
              color={Colors.accent}
              bgColor={Colors.accentLight}
            />
          </View>
        </View>

        {/* Time Slot Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Distribution</Text>
          {timeSlots.map(slot => (
            <TimeSlotRow key={slot.key} slot={slot} />
          ))}
        </View>

        {/* Daily Flow */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Flow</Text>
          {dailyFlow.slice(0, 10).map(day => (
            <DailyFlowRow key={day.date} day={day} />
          ))}
          {dailyFlow.length > 10 && (
            <Text style={styles.moreText}>
              +{dailyFlow.length - 10} more days
            </Text>
          )}
        </View>

        {/* Transfer History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transfers Out ({debitTransactions.length})</Text>
          {debitTransactions.slice(0, 8).map((t, idx) => (
            <TransactionRow
              key={`${t.datetime.getTime()}-${idx}`}
              transaction={t}
              color={Colors.danger}
            />
          ))}
          {debitTransactions.length > 8 && (
            <Text style={styles.moreText}>
              +{debitTransactions.length - 8} more
            </Text>
          )}
        </View>

        {/* Incoming Transfers */}
        {creditTransactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transfers In ({creditTransactions.length})</Text>
            {creditTransactions.slice(0, 8).map((t, idx) => (
              <TransactionRow
                key={`${t.datetime.getTime()}-${idx}`}
                transaction={t}
                color={Colors.success}
              />
            ))}
            {creditTransactions.length > 8 && (
              <Text style={styles.moreText}>
                +{creditTransactions.length - 8} more
              </Text>
            )}
          </View>
        )}

        {/* Import Button */}
        <TouchableOpacity
          style={[
            styles.importButton,
            isImporting && styles.importButtonDisabled,
          ]}
          onPress={handleImport}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color={Colors.surface} size="small" />
          ) : (
            <Text style={styles.importButtonText}>
              Import {stats.count} Transactions
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          disabled={isImporting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function SummaryCard({ label, value, color, bgColor }: SummaryCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor: color }]}>
      <Text style={[styles.cardLabel, { color }]}>{label}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
    </View>
  );
}

interface TimeSlot {
  key: string;
  label: string;
  credit: number;
  debit: number;
}

function TimeSlotRow({ slot }: { slot: TimeSlot }) {
  const total = slot.credit + slot.debit;
  const creditWidth = total > 0 ? (slot.credit / total) * 100 : 0;

  return (
    <View style={styles.slotContainer}>
      <Text style={styles.slotLabel}>{slot.label}</Text>
      <View style={styles.slotBar}>
        {creditWidth > 0 && (
          <View
            style={[
              styles.slotFill,
              { width: `${creditWidth}%`, backgroundColor: Colors.success },
            ]}
          />
        )}
        {100 - creditWidth > 0 && (
          <View
            style={[
              styles.slotFill,
              {
                width: `${100 - creditWidth}%`,
                backgroundColor: Colors.danger,
              },
            ]}
          />
        )}
      </View>
      <Text style={styles.slotValue}>
        ₹{slot.credit.toLocaleString('en-IN')} / ₹{slot.debit.toLocaleString('en-IN')}
      </Text>
    </View>
  );
}

interface DailyFlowRow {
  date: string;
  credit: number;
  debit: number;
}

function DailyFlowRow({ day }: { day: DailyFlowRow }) {
  const total = day.credit + day.debit;
  const creditWidth = total > 0 ? (day.credit / total) * 100 : 0;

  return (
    <View style={styles.dailyContainer}>
      <Text style={styles.dailyDate}>{day.date}</Text>
      <View style={styles.dailyBar}>
        {creditWidth > 0 && (
          <View
            style={[
              styles.dailyFill,
              { width: `${creditWidth}%`, backgroundColor: Colors.success },
            ]}
          />
        )}
        {100 - creditWidth > 0 && (
          <View
            style={[
              styles.dailyFill,
              {
                width: `${100 - creditWidth}%`,
                backgroundColor: Colors.danger,
              },
            ]}
          />
        )}
      </View>
      <Text style={styles.dailyValue}>
        ₹{day.credit.toLocaleString('en-IN')} ↓ / ₹{day.debit.toLocaleString('en-IN')} ↑
      </Text>
    </View>
  );
}

function TransactionRow({
  transaction,
  color,
}: {
  transaction: ParsedTransaction;
  color: string;
}) {
  const prefix = transaction.type === 'DEBIT' ? 'Paid to' : 'Received from';

  return (
    <View style={styles.txRow}>
      <View style={styles.txLeft}>
        <Text style={styles.txDesc}>
          {prefix} {transaction.counterparty}
        </Text>
        <Text style={styles.txTime}>
          {transaction.date} · {transaction.time}
        </Text>
      </View>
      <Text style={[styles.txAmount, { color }]}>
        ₹{transaction.amount.toLocaleString('en-IN')}
      </Text>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    maxHeight: '95%',
  } as const,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as const,
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  } as const,
  closeBtn: {
    fontSize: 24,
    color: Colors.text.secondary,
    padding: Spacing.sm,
  } as const,
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  } as const,
  section: {
    marginBottom: Spacing.lg,
  } as const,
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  } as const,
  cardsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  } as const,
  card: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    backgroundColor: Colors.accentLight,
  } as const,
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  } as const,
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  } as const,
  slotContainer: {
    marginBottom: Spacing.md,
  } as const,
  slotLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  } as const,
  slotBar: {
    flexDirection: 'row',
    height: 20,
    backgroundColor: Colors.border,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  } as const,
  slotFill: {
    height: '100%',
  } as const,
  slotValue: {
    fontSize: 12,
    color: Colors.text.secondary,
  } as const,
  dailyContainer: {
    marginBottom: Spacing.md,
  } as const,
  dailyDate: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  } as const,
  dailyBar: {
    flexDirection: 'row',
    height: 16,
    backgroundColor: Colors.border,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  } as const,
  dailyFill: {
    height: '100%',
  } as const,
  dailyValue: {
    fontSize: 11,
    color: Colors.text.secondary,
  } as const,
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as const,
  txLeft: {
    flex: 1,
  } as const,
  txDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  } as const,
  txTime: {
    fontSize: 12,
    color: Colors.text.secondary,
  } as const,
  txAmount: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: Spacing.md,
  } as const,
  moreText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  } as const,
  importButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  } as const,
  importButtonDisabled: {
    opacity: 0.6,
  } as const,
  importButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  } as const,
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  } as const,
  cancelButtonText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  } as const,
  spacer: {
    height: Spacing.lg,
  } as const,
};
