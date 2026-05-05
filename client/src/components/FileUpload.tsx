import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, X, CheckCircle } from "lucide-react";
import { buildApiUrl } from "@/lib/api-config";

interface FileUploadProps {
  endpoint: string;
  accept?: string;
  maxSize?: number; // in MB
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
}

export function FileUpload({
  endpoint,
  accept = "*/*",
  maxSize = 25,
  onSuccess,
  onError,
  multiple = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} exceeds maximum size of ${maxSize}MB`;
    }
    return null;
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles = Array.from(selectedFiles);
    const errors: string[] = [];

    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) errors.push(error);
    });

    if (errors.length > 0) {
      toast({
        title: "Upload Error",
        description: errors.join("\n"),
        variant: "destructive",
      });
      return;
    }

    setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
  };

  const uploadFile = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          setUploadedFiles(prev => [...prev, result]);
          onSuccess?.(result);
          toast({
            title: "Success",
            description: `${file.name} uploaded successfully!`,
          });
        } else {
          throw new Error(`Upload failed: ${xhr.statusText}`);
        }
      });

      xhr.addEventListener("error", () => {
        throw new Error("Upload failed");
      });

      xhr.open("POST", buildApiUrl(endpoint));
      xhr.setRequestHeader("Cookie", document.cookie);
      xhr.send(formData);
      
      return new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(xhr.statusText));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
      });
    } catch (err: any) {
      toast({
        title: "Upload Error",
        description: err.message,
        variant: "destructive",
      });
      onError?.(err.message);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(0);

    try {
      if (multiple) {
        for (let i = 0; i < files.length; i++) {
          await uploadFile(files[i], i);
        }
      } else {
        await uploadFile(files[0], 0);
      }
      setFiles([]);
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-muted-foreground">
          Max file size: {maxSize}MB
        </p>
      </div>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="p-1 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {uploading && (
              <Progress value={progress} className="w-full" />
            )}
            
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : `Upload ${files.length} file(s)`}
            </Button>
          </CardContent>
        </Card>
      )}

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-medium">Uploaded Files:</p>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{file.fileName || file.title || `File ${index + 1}`}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
