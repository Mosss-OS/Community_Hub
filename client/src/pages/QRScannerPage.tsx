import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCheckinWithLink } from "@/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LuLoader2, LuQrCode, LuCamera, LuCheckCircle2, LuAlertCircle } from 'react-icons/lu';

export default function QRScannerPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const checkinWithLink = useCheckinWithLink();
  const [scannerActive, setScannerActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          (scannerRef.current as any).stop();
        } catch (e) {}
      }
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setScannerActive(true);
    
    try {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scannerRef.current = scanner;
      
      scanner.render(
        (decodedText: string) => {
          (scanner as any).stop();
          setScannerActive(false);
          handleCheckin(decodedText);
        },
        (error: any) => {
          console.warn("QR scan error:", error);
        }
      );
    } catch (err: any) {
      setError(err.message || "Failed to start scanner");
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        (scannerRef.current as any).stop();
      } catch (e) {}
    }
    setScannerActive(false);
  };

  const handleCheckin = async (token: string) => {
    if (!user) return;
    
    setError(null);
    try {
      await checkinWithLink.mutateAsync({ token, notes: "Checked in via QR code" });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to check in");
    }
  };

  const handleManualCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    await handleCheckin(manualToken.trim());
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please log in to check in.</p>
            <Button onClick={() => setLocation("/login")}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Check-in Successful!</h2>
            <p className="text-green-700 mb-6">Thank you for checking in.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setSuccess(false); setManualToken(""); }}>
                Scan Another
              </Button>
              <Button onClick={() => setLocation("/attendance")}>
                View My Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Scan QR Code</h1>
        <p className="text-muted-foreground mt-2">
          Scan the attendance QR code to check in
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scannerActive ? (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
              <Button variant="outline" onClick={stopScanner} className="w-full">
                Stop Scanner
              </Button>
            </div>
          ) : (
            <Button onClick={startScanner} className="w-full gap-2">
              <QrCode className="h-4 w-4" />
              Start Camera
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Or enter code manually</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualCheckin} className="space-y-4">
            <Input
              placeholder="Enter attendance code"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!manualToken.trim() || checkinWithLink.isPending}
            >
              {checkinWithLink.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking in...
                </>
              ) : (
                "Check In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button variant="ghost" className="mt-6 w-full" onClick={() => setLocation("/attendance/checkin")}>
        Or check in manually
      </Button>
    </div>
  );
}
