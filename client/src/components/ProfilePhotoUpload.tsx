"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Crop, RotateCw, ZoomIn, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onSave?: (blob: Blob) => void;
  bio?: string;
  onBioChange?: (bio: string) => void;
}

export function ProfilePhotoUpload({ currentPhoto, onSave }: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!canvasRef.current || !preview) return;
    setIsSaving(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      const size = 200;
      canvas.width = size;
      canvas.height = size;
      
      ctx?.translate(size / 2, size / 2);
      ctx?.rotate((rotation * Math.PI) / 180);
      ctx?.scale(zoom, zoom);
      ctx?.drawImage(img, -size / 2, -size / 2, size, size);
      
      canvas.toBlob((blob) => {
        if (blob) {
          onSave?.(blob);
        }
        setIsSaving(false);
        setIsCropping(false);
      }, "image/jpeg", 0.9);
    };
    
    img.src = preview;
  };

  const handleCancel = () => {
    setPreview(null);
    setCroppedPreview(null);
    setZoom(1);
    setRotation(0);
    setIsCropping(false);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!isCropping ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-muted">
              {currentPhoto || preview ? (
                <img
                  src={preview || currentPhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <Button
              size="icon"
              className="absolute bottom-0 right-0 rounded-full h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Click to upload a new photo</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative h-64 w-64 mx-auto overflow-hidden rounded-full bg-muted">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([v]) => setZoom(v)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={90}
                onValueChange={([v]) => setRotation(v)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
