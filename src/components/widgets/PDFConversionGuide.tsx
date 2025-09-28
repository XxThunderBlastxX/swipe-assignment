"use client";

import React from "react";
import { FileText, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface PDFConversionGuideProps {
  onClose: () => void;
}

export default function PDFConversionGuide({ onClose }: PDFConversionGuideProps) {
  const conversionOptions = [
    {
      name: "SmallPDF",
      url: "https://smallpdf.com/pdf-to-word",
      description: "Free online PDF to DOCX converter",
      features: ["No registration required", "Secure file handling", "Fast conversion"]
    },
    {
      name: "PDF24",
      url: "https://tools.pdf24.org/en/pdf-to-word",
      description: "Free PDF to Word converter",
      features: ["Privacy-friendly", "No watermarks", "Batch conversion"]
    },
    {
      name: "ILovePDF",
      url: "https://www.ilovepdf.com/pdf_to_word",
      description: "Popular online PDF converter",
      features: ["Multiple file formats", "Cloud storage integration", "OCR support"]
    }
  ];

  const handleOpenConverter = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <FileText className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Convert PDF to DOCX</h2>
        <p className="text-muted-foreground">
          PDF parsing in browsers has compatibility issues. Convert your PDF to DOCX format for the best experience.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Recommended Online Converters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversionOptions.map((option, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{option.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {option.description}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {option.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenConverter(option.url)}
                  className="ml-4"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Convert
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2 text-blue-900">Quick Steps:</h4>
          <ol className="text-sm text-blue-800 space-y-1 ml-4">
            <li>1. Choose one of the converters above</li>
            <li>2. Upload your PDF resume</li>
            <li>3. Download the converted DOCX file</li>
            <li>4. Return here and upload the DOCX version</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2 text-yellow-900 flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Alternative: Manual Entry
          </h4>
          <p className="text-sm text-yellow-800 mb-3">
            If conversion doesn't work well, you can copy text from your PDF and enter it manually:
          </p>
          <ol className="text-sm text-yellow-800 space-y-1 ml-4">
            <li>1. Open your PDF resume</li>
            <li>2. Select and copy your name, email, and phone number</li>
            <li>3. Click "Skip Upload" below to enter details manually</li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Skip Upload - Enter Manually
        </Button>
        <Button onClick={onClose}>
          I'll Convert My PDF
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          💡 Tip: For future applications, save your resume as DOCX format for better compatibility
        </p>
      </div>
    </div>
  );
}
