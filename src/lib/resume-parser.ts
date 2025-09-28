import mammoth from "mammoth";

export interface ExtractedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  rawText: string;
}

// Regular expressions for extracting information
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX =
  /(\+\d{1,3}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g;

// Common name patterns - looking for lines that might contain names
const NAME_PATTERNS = [
  /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$/m, // First Last or First Middle Last
  /^([A-Z][A-Z\s]+)$/m, // ALL CAPS names
];

/**
 * Extract text from PDF file
 */
async function extractPDFText(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only available on the client side");
  }

  try {
    // Dynamically import PDF utilities on client-side only
    const { extractTextFromPDF, validatePDFFile, getPDFAlternatives } =
      await import("./pdf-utils");

    // Validate PDF file first
    const validation = validatePDFFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid PDF file");
    }

    // Try to extract text (will throw error with alternatives)
    const text = await extractTextFromPDF(file);
    return text;
  } catch (error) {
    console.error("Error extracting PDF text:", error);

    if (error instanceof Error) {
      // Enhance error message with helpful alternatives
      const alternatives = await import("./pdf-utils").then((m) =>
        m.getPDFAlternatives(),
      );
      const enhancedMessage =
        error.message +
        "\n\n" +
        "💡 " +
        alternatives.title +
        ":\n" +
        alternatives.steps.map((step, i) => `${i + 1}. ${step}`).join("\n");

      throw new Error(enhancedMessage);
    }

    throw new Error(
      "Failed to extract text from PDF. Please convert to DOCX format or enter information manually.",
    );
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

/**
 * Extract email from text
 */
function extractEmail(text: string): string | undefined {
  const emailMatches = text.match(EMAIL_REGEX);
  return emailMatches?.[0];
}

/**
 * Extract phone number from text
 */
function extractPhone(text: string): string | undefined {
  const phoneMatches = text.match(PHONE_REGEX);
  if (phoneMatches) {
    // Clean up the phone number
    const cleanPhone = phoneMatches[0].replace(/\D/g, "");
    if (cleanPhone.length >= 10) {
      return cleanPhone.length === 11 && cleanPhone.startsWith("1")
        ? cleanPhone.substring(1)
        : cleanPhone;
    }
  }
  return undefined;
}

/**
 * Extract name from text
 */
function extractName(text: string): string | undefined {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  // Try to find name in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (!line) continue;

    // Skip lines that are clearly not names
    if (
      line.includes("@") ||
      line.includes("http") ||
      line.includes("www") ||
      line.length > 50 ||
      /^\d/.test(line)
    ) {
      continue;
    }

    // Try each name pattern
    for (const pattern of NAME_PATTERNS) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const potentialName = match[1].trim();

        // Basic validation - should have at least first and last name
        const nameParts = potentialName.split(/\s+/);
        if (nameParts.length >= 2 && nameParts.length <= 4) {
          return potentialName;
        }
      }
    }

    // Fallback: if line looks like a name (2-3 words, proper case)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 3) {
      const looksLikeName = words.every(
        (word) => /^[A-Z][a-z]+$/.test(word) && word.length >= 2,
      );

      if (looksLikeName) {
        return line;
      }
    }
  }

  return undefined;
}

/**
 * Parse resume file and extract candidate information
 */
export async function parseResume(file: File): Promise<ExtractedResumeData> {
  const fileType = file.type;
  let rawText = "";

  try {
    if (fileType === "application/pdf") {
      rawText = await extractPDFText(file);
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      rawText = await extractTextFromDocx(file);
    } else {
      throw new Error(
        "Unsupported file format. Please upload PDF or DOCX files only.",
      );
    }

    // Extract information from text
    const name = extractName(rawText);
    const email = extractEmail(rawText);
    const phone = extractPhone(rawText);

    return {
      name,
      email,
      phone,
      rawText,
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
}

/**
 * Validate extracted resume data
 */
export function validateResumeData(data: ExtractedResumeData): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  if (!data.name?.trim()) {
    missingFields.push("name");
  }

  if (!data.email?.trim()) {
    missingFields.push("email");
  }

  if (!data.phone?.trim()) {
    missingFields.push("phone");
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone; // Return as-is if we can't format it
}
