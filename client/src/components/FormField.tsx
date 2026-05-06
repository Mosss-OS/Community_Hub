import { useState } from "react";
import { LuCheck, LuAlertCircle } from 'react-icons/lu';

interface FormFieldProps {
  label: string;
  error?: string;
  success?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, success, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      <div className="flex items-center gap-2">
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
        {success && !error && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <Check className="w-4 h-4" />
            Looks good!
          </p>
        )}
      </div>
    </div>
  );
}
