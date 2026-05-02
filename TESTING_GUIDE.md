# Testing Guide for PDF Statement Import

## Test Data Format

Below is an example of what a PhonePe transaction statement might look like when parsed:

### Sample Transactions

```
Transaction Statement for XXXXXXXXXX
Period: 1 Apr 2026 – 30 Apr 2026
```

Transaction rows (format: Date | Time | Description | Amount | Type):

```
30 Apr | 03:14 pm | Paid to Kattpa | ₹290 | Debit
30 Apr | 02:54 pm | Received from MAHADEO SO WAGADRE | ₹500 | Credit
29 Apr | 11:30 am | Paid to Swiggy - Food Order | ₹485 | Debit
29 Apr | 10:15 am | Paid to Uber | ₹180 | Debit
28 Apr | 09:00 pm | Paid to Amazon | ₹2200 | Debit
28 Apr | 08:45 pm | Received from Salary | ₹55000 | Credit
27 Apr | 05:30 pm | Paid to Zomato | ₹320 | Debit
27 Apr | 04:00 pm | Paid to Pharmacy | ₹450 | Debit
26 Apr | 02:20 pm | Paid to Metro Ticket | ₹50 | Debit
26 Apr | 01:10 pm | Received from Refund | ₹800 | Credit
25 Apr | 11:45 am | Paid to Coffee Cafe | ₹120 | Debit
25 Apr | 10:30 am | Paid to Mobile Recharge | ₹499 | Debit
24 Apr | 08:15 pm | Paid to Restaurant Dinner | ₹1200 | Debit
24 Apr | 07:00 pm | Received from Friend | ₹2000 | Credit
23 Apr | 06:30 pm | Paid to Electricity Bill | ₹1200 | Debit
23 Apr | 05:15 pm | Paid to Gas Bill | ₹350 | Debit
22 Apr | 04:00 pm | Paid to Shopping Mall | ₹3500 | Debit
22 Apr | 03:00 pm | Received from Parent | ₹10000 | Credit
21 Apr | 02:30 pm | Paid to Doctor Consultation | ₹500 | Debit
21 Apr | 01:45 pm | Paid to Medicine | ₹750 | Debit
```

## Expected Results After Parsing

### Summary Statistics
- **Total Credited**: ₹68,300
- **Total Debited**: ₹68,001
- **Net Balance**: ₹299 (positive, green)
- **Transaction Count**: 20

### Time Distribution (Example)
- **12am–6am**: ₹0 credit / ₹0 debit
- **6am–12pm**: ₹12,300 credit / ₹6,700 debit
- **12pm–6pm**: ₹500 credit / ₹8,500 debit
- **6pm–12am**: ₹55,500 credit / ₹52,801 debit

### Category Auto-Detection

| Counterparty | Detected Category | App Category |
|---|---|---|
| Kattpa | transfers | Other |
| MAHADEO SO WAGADRE | transfers | Other |
| Swiggy - Food Order | food | Food |
| Uber | travel | Transport |
| Amazon | shopping | Shopping |
| Salary | income | Income |
| Zomato | food | Food |
| Pharmacy | medical | Health |
| Metro Ticket | travel | Transport |
| Refund | transfers | Other |
| Coffee Cafe | food | Food |
| Mobile Recharge | utilities | Housing |
| Restaurant Dinner | food | Food |
| Friend | transfers | Other |
| Electricity Bill | utilities | Housing |
| Gas Bill | utilities | Housing |
| Shopping Mall | shopping | Shopping |
| Parent | transfers | Other |
| Doctor Consultation | medical | Health |
| Medicine | medical | Health |

## Testing Steps

### 1. Create a Test PDF (Manual)
- Generate a PDF with sample transaction data (above format)
- Save it as `sample_statement.pdf`
- Use a tool like ilovepdf.com or similar to create a text-based PDF

### 2. Test on Physical Device
1. Open the app on your device
2. Navigate to the **History** tab
3. Tap the **"📄 Import Statement"** button
4. Select your test PDF
5. Wait for parsing (should take 2-5 seconds)
6. Review the **Insights Modal**:
   - ✅ Summary cards match expected totals
   - ✅ Time distribution chart displays correctly
   - ✅ Daily flow shows per-day breakdown
   - ✅ Transfer history lists transactions
7. Tap **"Import [N] Transactions"**
8. Confirm the import dialog
9. Watch progress indicator (if multiple transactions)
10. See success alert
11. Navigate back to History tab
12. Verify transactions appear in the list

### 3. Verify Categorization
After import, check the History screen:
- Food transactions should show 🍱 icon and "Food" category
- Transport transactions should show 🚌 icon and "Transport" category
- Medical transactions should show 💊 icon and "Health" category
- Shopping transactions should show 🛍️ icon and "Shopping" category
- Utilities should show 🏠 icon and "Housing" category
- Transfers should show 📦 icon and "Other" category

### 4. Check AsyncStorage
Verify transactions were saved:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const transactions = await AsyncStorage.getItem('transactions');
console.log('Stored transactions:', JSON.parse(transactions));
```

## Common Issues & Solutions

### Issue: "Could not read this PDF"
**Cause**: PDF is scanned/image-based or encrypted
**Solution**: Use text-based PDFs only. Try re-exporting the statement in a different format.

### Issue: No transactions parsed
**Cause**: Text format doesn't match expected pattern
**Solution**: Check regex patterns in `parsePDF.ts`. Common formats:
- Date: `DD Mon` or `DD Mon YYYY`
- Time: `HH:MM am/pm`
- Amount: `₹XXX,XXX.XX` or `₹XXX`
- Type: `Debit` or `Credit`

### Issue: Wrong categories detected
**Cause**: Keyword not in `CATEGORY_KEYWORDS`
**Solution**: Add more keywords to `utils/categorize.ts` for better detection

### Issue: Dates are incorrect
**Cause**: Year not detected in PDF, defaults to current year
**Solution**: Ensure statement header includes year information

## Performance Metrics

**Expected Performance**:
- PDF parsing: ~100-500ms for 20-50 transactions
- Import speed: ~50-100ms per transaction
- Memory usage: <10MB for typical statement

## TypeScript Validation

Ensure no type errors after changes:
```bash
npx tsc --noEmit --skipLibCheck
```

## Debugging Tips

### Enable Console Logging
```typescript
// In parsePDF.ts
console.log('Extracted text length:', text.length);
console.log('Found transactions:', transactions.length);

// In useStatementImport.ts
console.log('PDF parsing completed:', parsedTxs.length);
console.log('Import progress:', state.progress);
```

### Inspect Parsed Transactions
```typescript
const statementImport = useStatementImport(...);
console.log('Parsed transactions:', statementImport.transactions);
```

### Test Regex Patterns
```typescript
// Test in browser console
const pattern = /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{1,2}):(\d{2})\s+(am|pm)/i;
const sample = "30 Apr 03:14 pm";
console.log(pattern.exec(sample)); // Should match
```

## Deployment Checklist

- [ ] TypeScript compiles without errors
- [ ] All imports resolve correctly
- [ ] PDF parsing handles edge cases
- [ ] UI renders correctly on different screen sizes
- [ ] Transactions import correctly into History
- [ ] Categories are auto-detected as expected
- [ ] AsyncStorage persistence works
- [ ] Error alerts display user-friendly messages
- [ ] No console warnings or errors
- [ ] Tested on physical device (not just simulator)
