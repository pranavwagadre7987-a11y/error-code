# PDF Statement Import Feature

## Overview

The **Scan & Import Statement** feature allows users to upload PhonePe (or any UPI) PDF transaction statements and automatically parse, categorize, and import transactions into the budget tracker app.

## Components

### 1. **PDF Parser** (`utils/parsePDF.ts`)
- **Function**: `parsePDFStatement(base64: string): Promise<ParsedTransaction[]>`
- Extracts text from PDF base64 content
- Uses regex patterns to identify transaction rows
- Parses dates, times, descriptions, amounts, and transaction types
- Returns an array of `ParsedTransaction` objects

**ParsedTransaction Type**:
```typescript
interface ParsedTransaction {
  date: string;           // "Apr 30, 2026"
  time: string;           // "03:14 pm"
  datetime: Date;         // parsed Date object
  hour: number;           // 0-23 for timing chart
  description: string;    // "Paid to Kattpa" or "Received from MAHADEO"
  counterparty: string;   // "Kattpa" or "MAHADEO"
  type: 'DEBIT' | 'CREDIT';
  amount: number;         // 290 (numeric, stripped of ₹ and commas)
  transactionId?: string;
  utrNo?: string;
}
```

### 2. **Category Detection** (`utils/categorize.ts`)
- **Function**: `detectCategory(description: string, counterparty: string): string`
- Keyword-based classification of transactions
- Maps to app categories: `food`, `medical`, `shopping`, `travel`, `utilities`, `savings`, `transfers`
- Example keywords:
  - **food**: biryani, restaurant, swiggy, zomato, cafe, baker, domino, pizza
  - **medical**: hospital, pharmacy, clinic, health, doctor
  - **travel**: uber, ola, metro, irctc, flight, train
  - **utilities**: electricity, gas, water, internet, phone bill

### 3. **Insights Modal** (`components/InsightsModal.tsx`)
Displays parsed transaction insights in a bottom-sheet modal:

#### Summary Cards
- **Credited**: Total income (green)
- **Debited**: Total expenses (red)
- **Net**: Balance (green if positive, red if negative)
- **Count**: Total transactions

#### Time Distribution Chart
Groups transactions by 4-hour slots:
- `12am–6am` (midnight)
- `6am–12pm` (morning)
- `12pm–6pm` (afternoon)
- `6pm–12am` (evening)

Shows stacked credit vs debit for each slot.

#### Daily Flow
Groups transactions by date with mini stacked bar chart showing daily credit/debit totals.

#### Transfer History
- **Transfers Out**: Lists all DEBIT transactions (red)
- **Transfers In**: Lists all CREDIT transactions (green)
- Format: "Paid to X · ₹amount · date · time"

#### Import Action
- Button to import all transactions with confirmation
- Shows progress during import
- Automatically categorizes each transaction
- Saves to AsyncStorage
- Shows success alert on completion

### 4. **Statement Import Hook** (`hooks/useStatementImport.ts`)
Orchestrates the entire import flow:

```typescript
const statementImport = useStatementImport(
  onImportComplete: () => void,  // Called after successful import
  addTransaction: (tx) => Promise<void>  // App's transaction saver
);
```

**State Object**:
```typescript
{
  isLoading: boolean;           // Reading PDF
  isImporting: boolean;         // Importing transactions
  error: string | null;
  transactions: ParsedTransaction[];
  progress: { current: number; total: number };
  
  // Methods
  pickPDFFile: () => Promise<ParsedTransaction[]>;
  importTransactions: (txs: ParsedTransaction[]) => Promise<void>;
  clearState: () => void;
}
```

## Usage

### Adding Import Button to History Screen

In `app/(tabs)/index.tsx`:

```typescript
import { useStatementImport } from '@/hooks/useStatementImport';
import { InsightsModal } from '@/components/InsightsModal';

export default function HomeScreen() {
  const { addTransaction } = useBudget();
  
  const statementImport = useStatementImport(
    () => { /* refresh after import */ },
    addTransaction
  );

  return (
    <>
      {/* Import Button */}
      <TouchableOpacity onPress={statementImport.pickPDFFile}>
        <Text>📄 Import Statement</Text>
      </TouchableOpacity>

      {/* Insights Modal */}
      <Modal visible={statementImport.transactions.length > 0}>
        <InsightsModal
          transactions={statementImport.transactions}
          onClose={() => statementImport.clearState()}
          onImport={statementImport.importTransactions}
          isImporting={statementImport.isImporting}
        />
      </Modal>
    </>
  );
}
```

## Transaction Processing

### Flow
1. **Pick PDF** → Uses `expo-document-picker`
2. **Read File** → Uses `expo-file-system` to read as base64
3. **Parse** → Extracts transactions from PDF text
4. **Display Insights** → Shows modal with statistics
5. **Categorize** → Keyword-based auto-categorization
6. **Import** → Saves each transaction using `addTransaction()`
7. **Refresh** → User navigates back to History

### Category Mapping

| Detected Category | App Category ID | App Category |
|---|---|---|
| food | 2 | Food |
| medical | 4 | Health |
| shopping | 5 | Shopping |
| travel | 3 | Transport |
| utilities | 1 | Housing |
| savings | 6 | Savings |
| transfers | 8 | Other |

## PDF Format Support

**Supported**: PhonePe/UPI transaction statements with text-based PDFs

**Expected Format**:
```
30 Apr 03:14 pm | Paid to Kattpa | ₹290 | Debit
30 Apr 02:54 pm | Received from Mahadeo | ₹500 | Credit
```

**Date Range**: Statements should include date, time, description, amount, and transaction type.

## Error Handling

- **Invalid PDF**: Shows alert if PDF cannot be read
- **No Transactions Found**: Alert if regex patterns don't match
- **Import Failure**: Shows error if AsyncStorage save fails
- **File Selection Cancelled**: Gracefully handles cancellation

## Installation

```bash
npx expo install expo-document-picker expo-file-system
npm install
```

## TypeScript Validation

Verify no errors:
```bash
npx tsc --noEmit --skipLibCheck
```

## Future Enhancements

1. **OCR Support**: Handle scanned PDFs using OCR
2. **Bank Statement Support**: Add parsers for different banks
3. **Duplicate Detection**: Warn about potential duplicate imports
4. **Custom Category Mapping**: Let users define custom keywords
5. **Batch Import**: Support multiple PDFs in one session
6. **Cloud Sync**: Sync imported transactions across devices
