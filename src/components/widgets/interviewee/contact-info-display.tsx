"use client";

import { CheckCircle, User, Mail, Phone, FileText, Edit2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { ExtractedContactInfo } from "~/lib/pdf-parser";

interface ContactInfoDisplayProps {
  extractedInfo: ExtractedContactInfo;
  onEdit: () => void;
  onConfirm: () => void;
}

export default function ContactInfoDisplay({
  extractedInfo,
  onEdit,
  onConfirm,
}: ContactInfoDisplayProps) {
  const { name, email, phone } = extractedInfo;

  const hasAllInfo = name && email && phone;
  const missingFields = [
    !name && "Name",
    !email && "Email",
    !phone && "Phone",
  ].filter(Boolean);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-xl">Information Extracted</CardTitle>
        <CardDescription>
          {hasAllInfo
            ? "All required information found"
            : `Missing: ${missingFields.join(", ")}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Name */}
        <div className="flex items-center space-x-3 p-3 border rounded-lg">
          <User className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <p className="text-sm text-gray-900">
              {name || <span className="italic text-gray-400">Not found</span>}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center space-x-3 p-3 border rounded-lg">
          <Mail className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-900">
              {email || <span className="italic text-gray-400">Not found</span>}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center space-x-3 p-3 border rounded-lg">
          <Phone className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <p className="text-sm text-gray-900">
              {phone || <span className="italic text-gray-400">Not found</span>}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex-1"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Details
          </Button>

          <Button
            onClick={onConfirm}
            className="flex-1"
            disabled={!hasAllInfo}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm
          </Button>
        </div>

        {!hasAllInfo && (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <FileText className="inline mr-1 h-4 w-4" />
            Some information couldn't be extracted automatically. You can edit the details above or try uploading a different PDF.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
