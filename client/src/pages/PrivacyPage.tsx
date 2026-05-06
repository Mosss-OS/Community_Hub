import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LuShield, LuDownload, LuTrash2, LuLoader2, LuCheckCircle2, LuAlertTriangle, LuEye, LuEyeOff, LuInfo } from 'react-icons/lu';
import { buildApiUrl } from "@/lib/api-config";

export default function PrivacyPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [attendanceVisible, setAttendanceVisible] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setExportSuccess(false);
    
    try {
      const res = await fetch(buildApiUrl("/api/gdpr/export"), {
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Export failed");
      
      const data = await res.json();
      
      // Generate PDF
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("My Church Data Export", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Profile Section
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Profile Information", 20, 45);
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      let y = 55;
      
      if (data.profile) {
        doc.text(`Name: ${data.profile.firstName || ""} ${data.profile.lastName || ""}`.trim(), 20, y);
        y += 7;
        doc.text(`Email: ${data.profile.email || "N/A"}`, 20, y);
        y += 7;
        doc.text(`Phone: ${data.profile.phone || "N/A"}`, 20, y);
        y += 7;
        doc.text(`House Fellowship: ${data.profile.houseFellowship || "N/A"}`, 20, y);
        y += 7;
        doc.text(`Parish: ${data.profile.parish || "N/A"}`, 20, y);
        y += 7;
        doc.text(`Role: ${data.profile.role || "N/A"}`, 20, y);
        y += 7;
        doc.text(`Member Since: ${data.profile.createdAt ? new Date(data.profile.createdAt).toLocaleDateString() : "N/A"}`, 20, y);
        y += 15;
      }
      
      // Attendance Section
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Attendance History", 20, y);
      y += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      if (data.attendance && data.attendance.length > 0) {
        doc.text(`Total Services Attended: ${data.attendance.length}`, 20, y);
        y += 10;
        
        // Table header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, y, 170, 8, "F");
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text("Date", 22, y + 5);
        doc.text("Service", 60, y + 5);
        doc.text("Type", 120, y + 5);
        doc.text("Status", 160, y + 5);
        y += 10;
        
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        
        // Show first 20 records
        const recordsToShow = data.attendance.slice(0, 20);
        for (const att of recordsToShow) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(att.serviceDate ? new Date(att.serviceDate).toLocaleDateString() : "N/A", 22, y);
          doc.text((att.serviceName || "").substring(0, 25), 60, y);
          doc.text(att.serviceType || "N/A", 120, y);
          doc.text(att.isOnline ? "Online" : "In Person", 160, y);
          y += 6;
        }
        
        if (data.attendance.length > 20) {
          y += 5;
          doc.setFontSize(9);
          doc.text(`... and ${data.attendance.length - 20} more records`, 20, y);
        }
      } else {
        doc.text("No attendance records found.", 20, y);
      }
      
      y += 20;
      
      // Event RSVPs Section
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Event RSVPs", 20, y);
      y += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      if (data.eventRsvps && data.eventRsvps.length > 0) {
        doc.text(`Total Events RSVP'd: ${data.eventRsvps.length}`, 20, y);
      } else {
        doc.text("No event RSVPs found.", 20, y);
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("This document was generated in accordance with GDPR data portability rights.", 20, 285);
      
      // Save PDF
      doc.save(`my-church-data-${new Date().toISOString().split("T")[0]}.pdf`);
      
      setExportSuccess(true);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE_MY_DATA") {
      setDeleteError("Please type 'DELETE_MY_DATA' to confirm");
      return;
    }
    
    setDeleting(true);
    setDeleteError("");
    
    try {
      const res = await fetch(buildApiUrl("/api/gdpr/delete"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirm }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      
      alert("Your data deletion request has been submitted.");
      setDeleteConfirm("");
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handlePrivacySave = async () => {
    try {
      await fetch(buildApiUrl("/api/gdpr/privacy"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          marketingConsent,
          attendanceVisibility: attendanceVisible ? "public" : "private",
        }),
        credentials: "include",
      });
      alert("Privacy settings saved!");
    } catch (err) {
      console.error("Failed to save privacy settings:", err);
    }
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
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please log in to manage your privacy settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Privacy & Data</h1>
        <p className="text-muted-foreground mt-2">
          Manage your data and privacy settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Your Data
            </CardTitle>
            <CardDescription>
              Download a copy of all your data including profile, attendance, and event RSVPs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exportSuccess ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Data exported successfully!</span>
              </div>
            ) : (
              <Button onClick={handleExport} disabled={exporting} className="gap-2">
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export My Data
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control who can see your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show attendance to group</Label>
                <p className="text-sm text-muted-foreground">
                  Allow group leaders to see your attendance
                </p>
              </div>
              <button
                onClick={() => setAttendanceVisible(!attendanceVisible)}
                className={`p-2 rounded-full transition-colors ${
                  attendanceVisible ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                }`}
              >
                {attendanceVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketing" 
                checked={marketingConsent}
                onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
              />
              <label
                htmlFor="marketing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Receive updates about church events and activities
              </label>
            </div>

            <Button onClick={handlePrivacySave} className="mt-2">
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Data Deletion */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Your Data
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Warning: This action cannot be undone</p>
                  <p className="mt-1">Your personal data will be permanently removed within 30 days.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Type DELETE_MY_DATA to confirm</Label>
              <Input
                id="confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE_MY_DATA"
              />
              {deleteError && (
                <p className="text-sm text-red-600">{deleteError}</p>
              )}
            </div>

            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deleteConfirm !== "DELETE_MY_DATA" || deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete My Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Your Rights Under GDPR</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to data portability</li>
                  <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
                  <li>Right to object to processing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
