# Feature Integration Guide

## App Architecture Overview

```
ASEP08 Budget Tracker
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx (📝 MODIFIED - Added import button & modal)
│   │   ├── explore.tsx
│   │   ├── add.tsx
│   │   └── profile.tsx
│   ├── modal.tsx (Add Transaction)
│   └── _layout.tsx
├── components/
│   ├── InsightsModal.tsx (✨ NEW - Statement insights display)
│   ├── themed-text.tsx
│   └── ...
├── hooks/
│   ├── useBudget.ts
│   ├── useStatementImport.ts (✨ NEW - Import orchestration)
│   └── ...
├── utils/
│   ├── parsePDF.ts (✨ NEW - PDF parsing logic)
│   ├── categorize.ts (✨ NEW - Category detection)
│   └── ...
├── constants/
│   └── index.ts (CATEGORIES, etc.)
└── package.json (✨ UPDATED - Added expo packages)
```

## New Files Summary

| File | Size | Purpose | Type |
|------|------|---------|------|
| `utils/parsePDF.ts` | ~280 lines | PDF text extraction & transaction parsing | Utility |
| `utils/categorize.ts` | ~100 lines | Keyword-based category detection | Utility |
| `components/InsightsModal.tsx` | ~500 lines | Bottom-sheet insights display | Component |
| `hooks/useStatementImport.ts` | ~200 lines | Import workflow orchestration | Hook |

## Modified Files

| File | Changes |
|------|---------|
| `app/(tabs)/index.tsx` | ✅ Import useStatementImport hook<br/>✅ Add import button to UI<br/>✅ Add Modal for InsightsModal<br/>✅ Add importButton style |

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ History Screen (index.tsx)                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [📄 Import Statement] ← NEW BUTTON                      │ │
│ │                                                          │ │
│ │ Transactions List                                        │ │
│ │ • Transaction 1                                          │ │
│ │ • Transaction 2                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        ↓ User taps "Import Statement"
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Document Picker (expo-document-picker)                      │
│ Select PDF file from device storage                         │
└─────────────────────────────────────────────────────────────┘
        ↓ User selects PDF
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Loading... (useStatementImport.pickPDFFile)                │
│ 1. Read file as base64 (expo-file-system)                  │
│ 2. Extract text (parsePDF.extractTextFromPDF)              │
│ 3. Parse transactions (parsePDF.parseTransactionsFromText) │
│ 4. Return ParsedTransaction[]                              │
└─────────────────────────────────────────────────────────────┘
        ↓ Parsing complete
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Insights Modal (InsightsModal.tsx) - BOTTOM SHEET          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Summary Cards                                            │ │
│ │ ┌─────────────┬─────────────┬─────────────┬───────────┐ │ │
│ │ │ Credited    │ Debited     │ Net         │ Count     │ │ │
│ │ │ ₹20,903     │ ₹20,329     │ ₹574 ✅     │ 186       │ │ │
│ │ └─────────────┴─────────────┴─────────────┴───────────┘ │ │
│ │                                                          │ │
│ │ Time Distribution (scrollable)                          │ │
│ │ 12am–6am: [  ] ₹X / ₹Y                                 │ │
│ │ 6am–12pm: [...] ₹X / ₹Y                                │ │
│ │ 12pm–6pm: [...] ₹X / ₹Y                                │ │
│ │ 6pm–12am: [...] ₹X / ₹Y                                │ │
│ │                                                          │ │
│ │ Daily Flow (scrollable)                                 │ │
│ │ Apr 30: [...] ₹X ↓ / ₹Y ↑                              │ │
│ │ Apr 29: [...] ₹X ↓ / ₹Y ↑                              │ │
│ │ ...                                                      │ │
│ │                                                          │ │
│ │ Transfers Out (scrollable)                              │ │
│ │ Paid to X · ₹290 · Apr 30, 3:14 pm                     │ │
│ │ Paid to Y · ₹500 · Apr 30, 2:54 pm                     │ │
│ │ ...                                                      │ │
│ │                                                          │ │
│ │ [Import 186 Transactions] ← MAIN ACTION                 │ │
│ │ [Cancel]                                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        ↓ User taps "Import 186 Transactions"
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Confirmation Alert                                          │
│ "Import 186 transactions into your app?"                   │
│ [Cancel] [Import]                                          │
└─────────────────────────────────────────────────────────────┘
        ↓ User confirms
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Importing... (useStatementImport.importTransactions)       │
│ Progress: 45 / 186 ✓                                       │
│                                                              │
│ For each ParsedTransaction:                                │
│ 1. Detect category (categorize.detectCategory)            │
│ 2. Map to app category (categorize.mapCategoryToId)       │
│ 3. Convert to Transaction type                            │
│ 4. Save via addTransaction (useBudget hook)               │
│ 5. Persist to AsyncStorage                                │
└─────────────────────────────────────────────────────────────┘
        ↓ Import completes
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Success Alert                                              │
│ "186 transactions imported successfully!"                  │
│ [OK]                                                       │
└─────────────────────────────────────────────────────────────┘
        ↓ User taps OK
        ↓
┌─────────────────────────────────────────────────────────────┐
│ History Screen (Back)                                      │
│ [📄 Import Statement]                                       │
│                                                              │
│ Transactions List (UPDATED - now includes imported ones)   │
│ • Paid to Kattpa · ₹290 · Apr 30 · Other 📦              │
│ • Swiggy Order · ₹485 · Apr 29 · Food 🍱                │
│ • Uber · ₹180 · Apr 29 · Transport 🚌                     │
│ • Amazon · ₹2,200 · Apr 28 · Shopping 🛍️                │
│ • Salary · ₹55,000 · Apr 28 · Income 💼                  │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────┐
│   User Device       │
│  (PhonePe App PDF)  │
└──────────┬──────────┘
           │
           ↓ expo-document-picker
┌─────────────────────────────────────┐
│  DocumentPicker.getDocumentAsync()   │
│  Returns: { uri, name, size }       │
└──────────┬──────────────────────────┘
           │
           ↓ expo-file-system
┌─────────────────────────────────────┐
│  FileSystem.readAsStringAsync()      │
│  Returns: base64 string             │
└──────────┬──────────────────────────┘
           │
           ↓ parsePDF.ts
┌─────────────────────────────────────────┐
│  extractTextFromPDF(base64)             │
│  → Buffer.from() → text extraction      │
│  Returns: readable text string          │
└──────────┬──────────────────────────────┘
           │
           ↓ parsePDF.ts
┌──────────────────────────────────────────┐
│  parseTransactionsFromText(text)         │
│  → Regex matching for transaction rows   │
│  → Date/time parsing                     │
│  → Amount parsing (₹ stripped)           │
│  Returns: ParsedTransaction[]            │
└──────────┬───────────────────────────────┘
           │
           ↓ categorize.ts
┌──────────────────────────────────────────┐
│  For each ParsedTransaction:             │
│  detectCategory(description, counterparty)│
│  → Keyword matching                      │
│  → Maps to: food, medical, shopping, ... │
│  → Default: transfers                    │
│  Returns: category string                │
└──────────┬───────────────────────────────┘
           │
           ↓ categorize.ts
┌──────────────────────────────────────────┐
│  mapCategoryToId(category)               │
│  food → '2', medical → '4', etc.        │
│  Returns: category ID for app            │
└──────────┬───────────────────────────────┘
           │
           ↓ Convert to app Transaction type
┌──────────────────────────────────────────┐
│  {                                       │
│    id: generated,                        │
│    title: counterparty,                  │
│    amount: ±number,                      │
│    categoryId: '2' (e.g.),              │
│    date: ISO string                      │
│  }                                       │
└──────────┬───────────────────────────────┘
           │
           ↓ useBudget.addTransaction()
┌──────────────────────────────────────────┐
│  AsyncStorage.setItem('transactions', ...) │
│  Persist to device storage               │
└──────────┬───────────────────────────────┘
           │
           ↓
┌──────────────────────────────────────────┐
│  Update UI: History screen now shows     │
│  imported transactions with icons &      │
│  categories auto-detected                │
└──────────────────────────────────────────┘
```

## Type System Flow

```
PDF File (base64)
    ↓
ParsedTransaction[] {
  date: "Apr 30, 2026"
  time: "03:14 pm"
  datetime: Date
  hour: 15
  description: "Paid to Kattpa"
  counterparty: "Kattpa"
  type: "DEBIT"
  amount: 290
}
    ↓
Transaction[] {
  id: "imported_1234567890_0"
  title: "Kattpa"
  amount: -290
  categoryId: "8" (Other)
  date: "2026-04-30T15:14:00.000Z"
}
    ↓
AsyncStorage {
  "transactions": [
    { id, title, amount, categoryId, date },
    ...
  ]
}
```

## Component Props

### InsightsModal
```typescript
interface InsightsModalProps {
  transactions: ParsedTransaction[];  // Parsed from PDF
  onClose: () => void;                // Clear state
  onImport: (transactions: ParsedTransaction[]) => void;  // Start import
  isImporting?: boolean;              // Loading state
}
```

### useStatementImport Hook
```typescript
interface ImportState {
  isLoading: boolean;           // Reading PDF
  isImporting: boolean;         // Saving transactions
  error: string | null;         // Error message
  transactions: ParsedTransaction[];  // Parsed data
  progress: {
    current: number;            // Imported count
    total: number;              // Total to import
  };
}
```

## Event Handlers

```
Button: "Import Statement"
  ↓ onClick
  → pickPDFFile()
    → showDocumentPicker()
    → readFileAsBase64()
    → parsePDFStatement()
    → setState(transactions)
    → showModal()
      ↓
    Modal: "Import [N] Transactions"
      ↓ onClick
      → importTransactions()
        → showConfirmation()
        → convertToAppTransactions()
        → addTransaction() for each
        → saveToAsyncStorage()
        → showSuccessAlert()
        → clearState()
        → dismissModal()
```

## Testing Checklist

- [ ] History screen displays "📄 Import Statement" button
- [ ] Tapping button opens document picker
- [ ] Selecting PDF shows loading indicator
- [ ] InsightsModal displays with all sections
- [ ] Summary cards show correct totals
- [ ] Time slots chart renders correctly
- [ ] Daily flow lists transactions
- [ ] Transfer history shows debits/credits
- [ ] Import button confirms before importing
- [ ] Progress bar updates during import
- [ ] Success alert shows transaction count
- [ ] Transactions appear in History screen
- [ ] Categories are auto-detected correctly
- [ ] Icons match categories
- [ ] Can import multiple files sequentially

---

This architecture ensures clean separation of concerns and easy maintenance/testing.
