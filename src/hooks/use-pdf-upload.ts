"use client";

import { useState } from "react";
import {
  extractContactInfoFromPDF as extractWithPDFJS,
  validatePDFFile,
  type ExtractedContactInfo,
} from "~/lib/pdf-parser";
import { extractContactInfoFromPDF as extractSimple } from "~/lib/pdf-parser-simple";

interface UsePDFUploadState {
  isProcessing: boolean;
  error: string | null;
  extractedInfo: ExtractedContactInfo | null;
}

interface UsePDFUploadReturn extends UsePDFUploadState {
  uploadAndExtract: (file: File) => Promise<void>;
  reset: () => void;
}

export function usePDFUpload(): UsePDFUploadReturn {
  const [state, setState] = useState<UsePDFUploadState>({
    isProcessing: false,
    error: null,
    extractedInfo: null,
  });

  const uploadAndExtract = async (file: File): Promise<void> => {
    // Reset previous state
    setState({
      isProcessing: true,
      error: null,
      extractedInfo: null,
    });

    try {
      // Validate file type
      if (!validatePDFFile(file)) {
        throw new Error("Please select a valid PDF file");
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB");
      }

      let extractedInfo: ExtractedContactInfo;

      try {
        // Try the full PDF.js extraction first
        extractedInfo = await extractWithPDFJS(file);
      } catch (pdfJsError) {
        console.warn(
          "PDF.js extraction failed, trying simple parser:",
          pdfJsError,
        );

        try {
          // Fallback to simple parser
          extractedInfo = await extractSimple(file);
        } catch (simpleError) {
          console.error("Both PDF parsers failed:", {
            pdfJsError,
            simpleError,
          });
          throw new Error(
            "Unable to process PDF. Please ensure it contains readable text or try a different PDF.",
          );
        }
      }

      setState({
        isProcessing: false,
        error: null,
        extractedInfo,
      });
    } catch (error) {
      setState({
        isProcessing: false,
        error: error instanceof Error ? error.message : "Failed to process PDF",
        extractedInfo: null,
      });
    }
  };

  const reset = (): void => {
    setState({
      isProcessing: false,
      error: null,
      extractedInfo: null,
    });
  };

  return {
    ...state,
    uploadAndExtract,
    reset,
  };
}
