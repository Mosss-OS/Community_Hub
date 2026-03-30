"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Camera, X, Check, AlertCircle, Flashlight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QRScannerProps {
  onScan?: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanning(true);
    } catch (err) {
      setError("Could not access camera. Please grant permission.");
      onError?.("Camera access denied");
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities && "torch" in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn } as MediaTrackConstraints]
        });
        setTorchOn(!torchOn);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />QR Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanning ? (
          <div className="text-center py-8">
            <div className="h-48 w-48 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
            <Button onClick={startScanning} className="gap-2">
              <Camera className="h-4 w-4" />Start Scanning
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-64 bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg" />
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2"
                onClick={toggleTorch}
              >
                <Flashlight className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 left-2"
                onClick={stopScanning}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Point the camera at a QR code
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QRCodeDisplay({ value, size = 200 }: { value: string; size?: number }) {
  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg">
      <QrCode size={size} className="text-foreground" />
    </div>
  );
}
