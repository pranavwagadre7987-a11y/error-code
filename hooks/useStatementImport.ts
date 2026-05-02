import { detectCategory, mapCategoryToId } from '@/utils/categorize';
import { parsePDFStatement, type ParsedTransaction } from '@/utils/parsePDF';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import type { Transaction } from './useBudget';

export interface ImportState {
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  transactions: ParsedTransaction[];
  progress: {
    current: number;
    total: number;
  };
}

export function useStatementImport(
  onImportComplete: (txs: Transaction[]) => void,
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>
) {
  const [state, setState] = useState<ImportState>({
    isLoading: false,
    isImporting: false,
    error: null,
    transactions: [],
    progress: { current: 0, total: 0 },
  });

  /**
   * Pick PDF file from device
   */
  const pickPDFFile = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.canceled) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No file selected');
      }

      const file = result.assets[0];

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: 'base64',
      });

      // Parse PDF
      const parsedTxs = await parsePDFStatement(base64);

      setState(prev => ({
        ...prev,
        isLoading: false,
        transactions: parsedTxs,
        error: null,
      }));

      return parsedTxs;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Could not read this PDF. Please ensure it is a PhonePe statement.';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        transactions: [],
      }));

      Alert.alert('Import Failed', errorMessage);
      return null;
    }
  }, []);

  /**
   * Convert ParsedTransaction to app Transaction
   */
  const convertToAppTransaction = useCallback(
    (parsed: ParsedTransaction): Omit<Transaction, 'id'> => {
      const category = detectCategory(parsed.description, parsed.counterparty);
      const categoryId = mapCategoryToId(category);

      // Negative amount for debits, positive for credits
      const amount =
        parsed.type === 'DEBIT' ? -parsed.amount : parsed.amount;

      return {
        title: parsed.counterparty,
        amount,
        categoryId,
        date: parsed.datetime.toISOString(),
      };
    },
    []
  );

  /**
   * Import all parsed transactions into app
   */
  const importTransactions = useCallback(
    async (parsedTxs: ParsedTransaction[]) => {
      try {
        setState(prev => ({
          ...prev,
          isImporting: true,
          progress: { current: 0, total: parsedTxs.length },
        }));

        const appTransactions: Transaction[] = [];

        for (let i = 0; i < parsedTxs.length; i++) {
          const appTx = convertToAppTransaction(parsedTxs[i]);
          const txWithId: Transaction = {
            ...appTx,
            id: `imported_${Date.now()}_${i}`,
          };

          appTransactions.push(txWithId);

          await addTransaction(appTx);

          setState(prev => ({
            ...prev,
            progress: { current: i + 1, total: parsedTxs.length },
          }));
        }

        setState(prev => ({
          ...prev,
          isImporting: false,
          transactions: [],
          progress: { current: 0, total: 0 },
        }));

        Alert.alert(
          'Success!',
          `${parsedTxs.length} transactions imported successfully!`
        );

        onImportComplete(appTransactions);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to import transactions';

        setState(prev => ({
          ...prev,
          isImporting: false,
          error: errorMessage,
        }));

        Alert.alert('Import Error', errorMessage);
      }
    },
    [addTransaction, convertToAppTransaction, onImportComplete]
  );

  /**
   * Clear state
   */
  const clearState = useCallback(() => {
    setState({
      isLoading: false,
      isImporting: false,
      error: null,
      transactions: [],
      progress: { current: 0, total: 0 },
    });
  }, []);

  return {
    ...state,
    pickPDFFile,
    importTransactions,
    clearState,
  };
}
