"use client";

import { useState, useRef } from "react";
import { LuX, LuUpload, LuFile, LuImage, LuVideo, LuMusic } from 'react-icons/lu';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploadProgressProps {
  accept?: string;
  maxSize?: number;
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<string>;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  children?: React.ReactNode;
}

function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) return Image;
  if (file.type.startsWith("video/")) return Video;
  if (file.type.startsWith("audio/")) return Music;
  return File;
}

export function FileUploadProgress({
  accept = "*",
  maxSize = 10 * 1024 * 1024,
  onUpload,
  onSuccess,
  onError,
  multiple = false,
  children,
}: FileUploadProgressProps) {
  const [files, setFiles] = useState<{ file: File; progress: number; status: "pending" | "uploading" | "complete" | "error"; url?: string; error?: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File, index: number) => {
    if (file.size > maxSize) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "error", error: `File too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB` }
          : f
        )
      );
      onError?.(`File too large: ${file.name}`);
      return;
    }

    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: "uploading" } : f))
    );

    try {
      const url = await onUpload(file, (progress) => {
        setFiles((prev) =>
          prev.map((f, i) => (i === index ? { ...f, progress } : f))
        );
      });
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "complete", progress: 100, url } : f))
      );
      onSuccess?.(url);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error", error: errorMsg } : f))
      );
      onError?.(errorMsg);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((_, index) => processFile(fileList[index], files.length + index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const completedCount = files.filter((f) => f.status === "complete").length;
  const totalProgress = files.length > 0
    ? Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length)
    : 0;

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
        {children || (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Max size: {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.length > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedCount} of {files.length} files uploaded
              </span>
              <span className="font-medium">{totalProgress}%</span>
            </div>
          )}
          {files.length > 1 && <Progress value={totalProgress} className="h-2" />}
          
          {files.map((file, index) => {
            const Icon = getFileIcon(file.file);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-card border rounded-lg"
              >
                <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="h-1 flex-1" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {file.status === "pending" && "Waiting..."}
                      {file.status === "uploading" && `${file.progress}%`}
                      {file.status === "complete" && "Complete"}
                      {file.status === "error" && file.error}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.url);
        } else {
          reject(new Error("Upload failed"));
        }
      });

      xhr.addEventListener("error", () => {
        setUploading(false);
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", "/api/upload");
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  };

  return { uploadFile, progress, uploading };
}
