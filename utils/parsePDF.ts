/**
 * PDF Parser for PhonePe/UPI transaction statements
 * Extracts transaction data from PDF base64 content
 */

export interface ParsedTransaction {
  date: string; // "Apr 30, 2026"
  time: string; // "03:14 pm"
  datetime: Date; // parsed Date object
  hour: number; // 0-23 for timing chart
  description: string; // "Paid to Kattpa" or "Received from MAHADEO SO WAGADRE"
  counterparty: string; // "Kattpa" or "MAHADEO SO WAGADRE"
  type: 'DEBIT' | 'CREDIT';
  amount: number; // 290 (numeric, strip ₹ and commas)
  transactionId?: string;
  utrNo?: string;
}

/**
 * Extract text from PDF base64 string
 * Uses regex to find transaction patterns in the PDF text layer
 */
export function extractTextFromPDF(base64: string): string {
  try {
    // Convert base64 to string
    const binaryStr = Buffer.from(base64, 'base64').toString('binary');
    
    // Extract readable text by removing control characters and non-printable chars
    let text = '';
    for (let i = 0; i < binaryStr.length; i++) {
      const code = binaryStr.charCodeAt(i);
      // Keep printable ASCII and common Unicode ranges
      if ((code >= 32 && code <= 126) || code >= 128) {
        text += binaryStr[i];
      } else if (code === 10 || code === 13) {
        // Keep line breaks
        text += '\n';
      }
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Parse transactions from extracted PDF text
 * Looks for patterns like: Date | Time | Description | Amount | Type
 */
export function parseTransactionsFromText(
  text: string
): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  // Split by lines and process
  const lines = text.split('\n');

  // Regex patterns for transaction rows
  // Format: "30 Apr 03:14 pm | Paid to Kattpa | ₹290 | Debit" or similar variants
  const transactionPattern =
    /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{1,2}):(\d{2})\s+(am|pm)\s*\|\s*(.+?)\s*\|\s*[₹]?([\d,]+(?:\.\d{2})?)\s*\|\s*(Debit|Credit|DEBIT|CREDIT)/i;

  // Also try alternative pattern without pipes
  const altPattern =
    /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{1,2}):(\d{2})\s+(am|pm)\s+(.+?)\s+[₹]([\d,]+(?:\.\d{2})?)\s+(Debit|Credit|DEBIT|CREDIT)/i;

  const dateLinePattern =
    /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/;

  let currentYear = new Date().getFullYear();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Check if this line contains year info
    const yearMatch = dateLinePattern.exec(line);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[3], 10);
      continue;
    }

    // Try main pattern
    let match = transactionPattern.exec(line);
    if (!match) {
      // Try alternative pattern
      match = altPattern.exec(line);
    }

    if (match) {
      try {
        const day = parseInt(match[1], 10);
        const monthStr = match[2];
        const hour = parseInt(match[3], 10);
        const minute = parseInt(match[4], 10);
        const meridiem = match[5].toLowerCase();
        const description = match[6].trim();
        const amountStr = match[7];
        const typeStr = match[8];

        // Parse amount
        const amount = parseFloat(amountStr.replace(/[₹,]/g, ''));
        if (isNaN(amount)) continue;

        // Parse type
        const type = typeStr.toLowerCase() === 'debit' ? 'DEBIT' : 'CREDIT';

        // Convert 12-hour to 24-hour format
        let hours24 = hour;
        if (meridiem === 'pm' && hour !== 12) {
          hours24 = hour + 12;
        } else if (meridiem === 'am' && hour === 12) {
          hours24 = 0;
        }

        // Parse date
        const monthMap: Record<string, number> = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
        };
        const monthNum = monthMap[monthStr.toLowerCase()];
        if (monthNum === undefined) continue;

        const dateTime = new Date(
          currentYear,
          monthNum,
          day,
          hours24,
          minute,
          0
        );

        // Format date string
        const monthName = new Date(dateTime).toLocaleString('default', {
          month: 'short',
        });
        const dateStr = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${day}, ${currentYear}`;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')} ${meridiem}`;

        // Extract counterparty from description
        const counterparty = extractCounterparty(description, type);

        const transaction: ParsedTransaction = {
          date: dateStr,
          time: timeStr,
          datetime: dateTime,
          hour: hours24,
          description,
          counterparty,
          type,
          amount,
          transactionId: undefined,
          utrNo: undefined,
        };

        transactions.push(transaction);
      } catch (error) {
        console.warn('Error parsing transaction line:', line, error);
      }
    }
  }

  return transactions;
}

/**
 * Extract counterparty name from transaction description
 */
function extractCounterparty(description: string, type: 'DEBIT' | 'CREDIT'): string {
  // Patterns: "Paid to X", "Received from X", "Self Transfer to X", "Sent to X"
  const patterns = [
    /(?:Paid to|Sent to|Transferred to)\s+([^•\n]+)/i,
    /Received from\s+([^•\n]+)/i,
    /Self Transfer to\s+([^•\n]+)/i,
    /To:\s*([^•\n]+)/i,
    /From:\s*([^•\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(description);
    if (match) {
      return match[1].trim();
    }
  }

  // Fallback: return first meaningful part after transaction type
  return description.replace(/(Paid to|Received from|Sent to|Transferred to|Self Transfer to)/i, '')
    .trim()
    .split(/[•\n]/)[0]
    .trim() || 'Unknown';
}

/**
 * Main function to parse PDF
 */
export async function parsePDFStatement(base64: string): Promise<ParsedTransaction[]> {
  try {
    const text = extractTextFromPDF(base64);
    
    if (!text || text.length < 100) {
      throw new Error('PDF appears to be empty or not readable');
    }

    const transactions = parseTransactionsFromText(text);

    if (transactions.length === 0) {
      throw new Error(
        'No transactions found. Please ensure this is a PhonePe/UPI PDF statement.'
      );
    }

    // Sort by datetime descending (newest first)
    transactions.sort((a, b) => b.datetime.getTime() - a.datetime.getTime());

    return transactions;
  } catch (error) {
    console.error('PDF parsing failed:', error);
    throw error;
  }
}
