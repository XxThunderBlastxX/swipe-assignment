"use client";

export interface ExtractedContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  rawText: string;
}

/**
 * Dynamically import PDF.js to avoid SSR issues
 */
async function loadPDFJS() {
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only available on the client side");
  }

  const pdfjsLib = await import("pdfjs-dist");

  // Set up PDF.js worker with reliable CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.mjs`;

  return pdfjsLib;
}

/**
 * Extract text content from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await loadPDFJS();
    const arrayBuffer = await file.arrayBuffer();

    // Use legacy build parameters for better compatibility
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => {
          if (item.str) {
            return item.str;
          }
          return "";
        })
        .join(" ");

      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extract name from resume text using common patterns
 */
function extractName(text: string): string | undefined {
  // Remove common resume headers and clean text
  const cleanText = text
    .replace(/resume|curriculum vitae|cv|profile|summary/gi, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Look for name patterns at the beginning of the document
  const namePatterns = [
    // First few words that look like names (2-3 capitalized words)
    /^([A-Z][a-z]{1,15}\s+[A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\s/,
    // Name after "Name:" label
    /(?:name|full name)\s*:?\s*([A-Z][a-z]{1,15}\s+[A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)/i,
    // Looking for pattern at start of lines
    /^([A-Z][a-z]{1,15}\s+[A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\s*$/m,
  ];

  for (const pattern of namePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Validate it looks like a real name (no numbers, reasonable length)
      if (!/\d/.test(name) && name.length >= 4 && name.length <= 50) {
        // Additional check: ensure it's not common resume words
        const commonWords =
          /^(objective|summary|experience|education|skills|contact|about)$/i;
        if (!commonWords.test(name)) {
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
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
  const emails = text.match(emailPattern);

  if (emails && emails.length > 0) {
    // Filter out obviously fake or template emails
    const validEmails = emails.filter((email) => {
      const lowerEmail = email.toLowerCase();
      return (
        !lowerEmail.includes("example") &&
        !lowerEmail.includes("template") &&
        !lowerEmail.includes("sample") &&
        !lowerEmail.includes("test")
      );
    });

    if (validEmails.length > 0) {
      // Return the first valid email found, or prefer common email providers
      const preferredProviders = [
        "gmail",
        "yahoo",
        "outlook",
        "hotmail",
        "icloud",
      ];
      const preferredEmail = validEmails.find((email) =>
        preferredProviders.some((provider) =>
          email.toLowerCase().includes(provider),
        ),
      );

      return preferredEmail || validEmails[0];
    }
  }

  return undefined;
}

/**
 * Extract phone numbers from text
 */
function extractPhone(text: string): string | undefined {
  const phonePatterns = [
    // US formats with area code: (123) 456-7890, 123-456-7890, 123.456.7890
    /\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    // International format: +1 123 456 7890
    /\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    // 10 digit number: 1234567890
    /\b([0-9]{10})\b/g,
  ];

  for (const pattern of phonePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match[0]) {
        // Clean up the phone number
        const digits = match[0].replace(/\D/g, "");

        // Skip if it doesn't look like a phone number
        if (digits.length < 10 || digits.length > 11) continue;

        // Skip if it's all the same digit (likely not a real number)
        if (/^(\d)\1+$/.test(digits)) continue;

        // Format the phone number
        let phone = digits;
        if (phone.length === 10) {
          phone = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
        } else if (phone.length === 11 && phone.startsWith("1")) {
          const number = phone.slice(1);
          phone = `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
        }

        return phone;
      }
    }
  }

  return undefined;
}

/**
 * Parse contact information from extracted PDF text
 */
export function parseContactInfo(text: string): ExtractedContactInfo {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    rawText: text,
  };
}

/**
 * Main function to extract contact info from PDF file
 */
export async function extractContactInfoFromPDF(
  file: File,
): Promise<ExtractedContactInfo> {
  try {
    const text = await extractTextFromPDF(file);
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
