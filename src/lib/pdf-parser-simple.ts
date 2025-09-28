"use client";

export interface ExtractedContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  rawText: string;
}

/**
 * Simple PDF text extraction using basic PDF structure parsing
 * This avoids the worker issues by doing basic text extraction
 */
async function extractTextFromPDFSimple(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Convert to string for basic text extraction
    let text = "";
    for (let i = 0; i < uint8Array.length; i++) {
      const char = String.fromCharCode(uint8Array[i]!);
      // Only include printable ASCII characters
      if (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) {
        text += char;
      } else if (char.charCodeAt(0) === 10 || char.charCodeAt(0) === 13) {
        text += " "; // Replace line breaks with spaces
      }
    }

    // Clean up the extracted text
    return text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/[^\w\s@.\-()]/g, " ") // Keep only word chars, spaces, email chars, phone chars
      .trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extract name from resume text using common patterns
 */
function extractName(text: string): string | undefined {
  // Look for patterns that might be names
  const namePatterns = [
    // Two or three capitalized words at the beginning
    /^[A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?/,
    // Name after common labels
    /(?:Name|Full Name|Candidate)\s*:?\s*([A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15}(?:\s+[A-Z][a-z]{2,15})?)/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      const name = (match[1] || match[0]).trim();
      // Validate it looks like a real name
      if (name.length >= 5 && name.length <= 50 && !name.match(/\d/)) {
        // Skip common resume section headers
        const skipWords =
          /^(objective|summary|experience|education|skills|contact|about|profile|career|professional|personal)$/i;
        if (!skipWords.test(name.split(" ")[0]!)) {
          return name;
        }
      }
    }
  }

  return undefined;
}

/**
 * Extract email addresses from text
 */
function extractEmail(text: string): string | undefined {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailPattern);

  if (emails && emails.length > 0) {
    // Filter out template/example emails
    const validEmails = emails.filter((email) => {
      const lower = email.toLowerCase();
      return (
        !lower.includes("example") &&
        !lower.includes("template") &&
        !lower.includes("sample") &&
        !lower.includes("test") &&
        lower.length < 50
      ); // Reasonable length check
    });

    if (validEmails.length > 0) {
      // Prefer common email providers
      const preferredProviders = [
        "gmail",
        "yahoo",
        "outlook",
        "hotmail",
        "icloud",
      ];
      const preferred = validEmails.find((email) =>
        preferredProviders.some((provider) =>
          email.toLowerCase().includes(provider),
        ),
      );

      return preferred || validEmails[0];
    }
  }

  return undefined;
}

/**
 * Extract phone numbers from text
 */
function extractPhone(text: string): string | undefined {
  const phonePatterns = [
    // Standard US formats
    /\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    // 10 digit numbers
    /\b([0-9]{10})\b/g,
  ];

  for (const pattern of phonePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match[0]) {
        const digits = match[0].replace(/\D/g, "");

        // Must be exactly 10 or 11 digits
        if (digits.length === 10) {
          // Skip obviously fake numbers (all same digit)
          if (!/^(\d)\1+$/.test(digits)) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
          }
        } else if (digits.length === 11 && digits.startsWith("1")) {
          const number = digits.slice(1);
          if (!/^(\d)\1+$/.test(number)) {
            return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
          }
        }
      }
    }
  }

  return undefined;
}

/**
 * Parse contact information from extracted text
 */
export function parseContactInfo(text: string): ExtractedContactInfo {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    rawText: text.substring(0, 1000), // Limit raw text length
  };
}

/**
 * Main function to extract contact info from PDF file using simple method
 */
export async function extractContactInfoFromPDF(
  file: File,
): Promise<ExtractedContactInfo> {
  try {
    const text = await extractTextFromPDFSimple(file);
    return parseContactInfo(text);
  } catch (error) {
    console.error("Error extracting contact info from PDF:", error);
    throw error;
  }
}

/**
 * Validate that the uploaded file is a PDF
 */
export function validatePDFFile(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}
