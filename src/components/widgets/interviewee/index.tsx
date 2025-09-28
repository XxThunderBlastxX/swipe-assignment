"use client";

import { useState, useRef } from "react";
import { Upload, Edit, FileText, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { usePDFUpload } from "~/hooks/use-pdf-upload";
import ContactInfoDisplay from "./contact-info-display";

type ViewState = "initial" | "processing" | "extracted" | "manual-entry";

export default function IntervieweeWidget() {
  const [viewState, setViewState] = useState<ViewState>("initial");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isProcessing, error, extractedInfo, uploadAndExtract, reset } =
    usePDFUpload();

  const handleUploadResume = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setViewState("processing");

    try {
      await uploadAndExtract(file);
      setViewState("extracted");
    } catch (error) {
      console.error("Failed to process PDF:", error);
      // Stay in processing state to show error
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualEntry = () => {
    setViewState("manual-entry");
  };

  const handleEditDetails = () => {
    setViewState("manual-entry");
  };

  const handleConfirmInfo = () => {
    if (extractedInfo) {
      console.log("Confirmed contact info:", {
        name: extractedInfo.name,
        email: extractedInfo.email,
        phone: extractedInfo.phone,
      });
      // TODO: Navigate to next step or save to state/database
      alert(
        `Information confirmed!\nName: ${extractedInfo.name}\nEmail: ${extractedInfo.email}\nPhone: ${extractedInfo.phone}`,
      );
    }
  };

  const handleBackToStart = () => {
    reset();
    setViewState("initial");
  };

  const renderContent = () => {
    switch (viewState) {
      case "processing":
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                ) : error ? (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                ) : (
                  <FileText className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <CardTitle className="text-xl">
                {isProcessing
                  ? "Processing Resume..."
                  : error
                    ? "Error"
                    : "Processing Complete"}
              </CardTitle>
              <CardDescription>
                {isProcessing
                  ? "Extracting your contact information from the PDF"
                  : error
                    ? error
                    : "Your resume has been processed"}
              </CardDescription>
            </CardHeader>

            {error && (
              <CardContent className="text-center">
                <Button onClick={handleBackToStart} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            )}
          </Card>
        );

      case "extracted":
        if (!extractedInfo) return null;
        return (
          <ContactInfoDisplay
            extractedInfo={extractedInfo}
            onEdit={handleEditDetails}
            onConfirm={handleConfirmInfo}
          />
        );

      case "manual-entry":
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Manual Entry</CardTitle>
              <CardDescription>Enter your details manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Add form fields for manual entry */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={extractedInfo?.name || ""}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={extractedInfo?.email || ""}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={extractedInfo?.phone || ""}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleBackToStart}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button className="flex-1">Submit</Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome, Interviewee</CardTitle>
              <CardDescription>
                Choose how you'd like to provide your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,application/pdf"
                className="hidden"
              />

              <Button
                onClick={handleUploadResume}
                className="w-full h-12 text-base"
                variant="default"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Resume
              </Button>

              <Button
                onClick={handleManualEntry}
                className="w-full h-12 text-base"
                variant="outline"
              >
                <Edit className="mr-2 h-5 w-5" />
                Enter Details Manually
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="w-full h-lvh justify-center items-center flex">
      {renderContent()}
    </div>
  );
}
