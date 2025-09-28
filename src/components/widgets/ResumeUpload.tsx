"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  parseResume,
  validateResumeData,
  formatPhoneNumber,
  type ExtractedResumeData,
} from "~/lib/resume-parser";
import type { CandidateInfo } from "~/types/interview";

interface ResumeUploadProps {
  onDataExtracted: (candidateInfo: CandidateInfo) => void;
  onError: (error: string) => void;
}

export default function ResumeUpload({
  onDataExtracted,
  onError,
}: ResumeUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] =
    useState<ExtractedResumeData | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [manualData, setManualData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsProcessing(true);

      try {
        // Show different messages based on file type
        const isPDF = file.type === "application/pdf";
        if (isPDF) {
          console.log("Processing PDF file...");
        }

        const data = await parseResume(file);
        const validation = validateResumeData(data);

        setExtractedData(data);
        setMissingFields(validation.missingFields);

        // Pre-fill manual data with extracted data
        setManualData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });

        if (validation.isValid) {
          // All fields found, proceed directly
          onDataExtracted({
            name: data.name!,
            email: data.email!,
            phone: data.phone!,
          });
        }
      } catch (error) {
        console.error("Resume parsing error:", error);
        let errorMessage = "Failed to parse resume";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        // Provide helpful suggestions for PDF issues
        if (file.type === "application/pdf") {
          // Show a more user-friendly error for PDFs
          errorMessage =
            "PDF processing is currently not supported in browsers. Please convert your PDF to DOCX format using online tools like SmallPDF or PDF24, or manually enter your information below.";
        }

        onError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [onDataExtracted, onError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    onDropRejected: (rejectedFiles) => {
      const file = rejectedFiles[0];
      if (file && file.file.type === "application/pdf") {
        onError(
          "PDF files require conversion to DOCX format. Please use an online converter like SmallPDF or PDF24, then upload the DOCX version.",
        );
      }
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleManualSubmit = () => {
    const { name, email, phone } = manualData;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      onError("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      onError("Please enter a valid email address");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\d{10}$/;
    const cleanPhone = phone.replace(/\D/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      onError("Please enter a valid 10-digit phone number");
      return;
    }

    onDataExtracted({
      name: name.trim(),
      email: email.trim(),
      phone: cleanPhone,
    });
  };

  const handleInputChange = (field: keyof typeof manualData, value: string) => {
    setManualData((prev) => ({ ...prev, [field]: value }));
  };

  if (missingFields.length > 0 && extractedData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Missing Information</h2>
          <p className="text-muted-foreground mb-6">
            We extracted some information from your resume, but need a few more
            details to get started.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name{" "}
                {missingFields.includes("name") && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <Input
                id="name"
                type="text"
                value={manualData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={
                  missingFields.includes("name") ? "border-yellow-300" : ""
                }
              />
              {extractedData.name && !missingFields.includes("name") && (
                <div className="flex items-center mt-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Extracted from resume
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address{" "}
                {missingFields.includes("email") && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <Input
                id="email"
                type="email"
                value={manualData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                className={
                  missingFields.includes("email") ? "border-yellow-300" : ""
                }
              />
              {extractedData.email && !missingFields.includes("email") && (
                <div className="flex items-center mt-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Extracted from resume
                </div>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number{" "}
                {missingFields.includes("phone") && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <Input
                id="phone"
                type="tel"
                value={manualData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
                className={
                  missingFields.includes("phone") ? "border-yellow-300" : ""
                }
              />
              {extractedData.phone && !missingFields.includes("phone") && (
                <div className="flex items-center mt-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Extracted from resume:{" "}
                  {formatPhoneNumber(extractedData.phone)}
                </div>
              )}
            </div>

            <Button onClick={handleManualSubmit} className="w-full" size="lg">
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Upload Your Resume</h2>
        <p className="text-muted-foreground">
          Upload your DOCX resume to get started with the interview
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }
              ${isProcessing ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <input {...getInputProps()} />

            {isProcessing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Processing your resume...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {isDragActive ? (
                    <Upload className="h-12 w-12 text-primary" />
                  ) : (
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                <div>
                  {isDragActive ? (
                    <p className="text-sm text-primary font-medium">
                      Drop your resume here...
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Drag and drop your resume here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports DOCX files (max 10MB). PDF support coming soon
                        - please convert PDF to DOCX format.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          We'll extract your name, email, and phone number from your DOCX resume
          to get started.
        </p>
        <p className="text-xs text-muted-foreground">
          📄 Have a PDF? Convert it to DOCX using online tools like SmallPDF or
          PDF24, or manually enter your details below if extraction fails.
        </p>
      </div>
    </div>
  );
}
