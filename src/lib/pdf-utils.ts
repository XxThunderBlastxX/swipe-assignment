/**
 * PDF utilities for resume parsing
 *
 * Note: Due to browser compatibility issues with PDF parsing libraries,
 * we provide a user-friendly alternative approach for PDF files.
 */

export interface PDFTextContent {
  text: string;
  pageNumber: number;
}

/**
 * Extract text from PDF file
 * For now, we guide users to convert PDF to DOCX or provide manual input
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only available on the client side");
  }

  // Since PDF parsing in browsers has compatibility issues,
  // we'll provide a helpful error message with alternatives
  throw new Error(
    "PDF text extraction is not currently supported in the browser. Please either:\n\n" +
      "1. Convert your PDF resume to DOCX format using online tools like SmallPDF or PDF24\n" +
      "2. Copy the text from your PDF and paste it manually when prompted\n" +
      "3. Save your resume as a DOCX file from your word processor\n\n" +
      "We apologize for the inconvenience and are working on improving PDF support.",
  );
}

/**
 * Validate PDF file before processing
 */
export function validatePDFFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Check file type
  if (file.type !== "application/pdf") {
    return {
      isValid: false,
      error: "File must be a PDF document",
    };
  }

  // Check file size (limit to 25MB)
  const maxSize = 25 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "PDF file size must be less than 25MB",
    };
  }

  // Check file size isn't too small (likely empty)
  if (file.size < 1024) {
    return {
      isValid: false,
      error: "PDF file appears to be empty or corrupted",
    };
  }

  return { isValid: true };
}

/**
 * Check if PDF parsing is available
 */
export function isPDFParseAvailable(): boolean {
  // Currently not available due to browser compatibility
  return false;
}

/**
 * Preload function - not needed but kept for compatibility
 */
export async function preloadPDFWorker(): Promise<void> {
  return Promise.resolve();
}

/**
 * Provide alternative options for PDF users
 */
export function getPDFAlternatives(): {
  title: string;
  description: string;
  steps: string[];
} {
  return {
    title: "Alternative Options for PDF Resumes",
    description:
      "Since PDF parsing has browser compatibility issues, here are some alternatives:",
    steps: [
      "Convert PDF to DOCX using online converters (SmallPDF, PDF24, or similar)",
      "Open your PDF and copy all text, then paste manually when prompted",
      "If you have the original document, save it as DOCX format",
      "Use 'Print to PDF' from a DOCX version if available",
    ],
  };
}
