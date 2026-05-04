import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/lib/api-config";

interface Contact {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}

export function ContactExport() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportVCard = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(buildApiUrl("/api/members?limit=1000"), {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      const contacts: Contact[] = data.members || [];

      const vcards = contacts.map(c => [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${c.firstName} ${c.lastName}`.trim(),
        `EMAIL:${c.email}`,
        c.phone && `TEL:${c.phone}`,
        c.address && `ADR;TYPE=HOME:;;${c.address}`,
      ].filter(Boolean).join("\r\n") + "\r\nEND:VCARD";

      const blob = new Blob([vcards.join("\r\n\r\n")], { type: "text/vcard" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts_${new Date().toISOString().split("T")[0]}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "VCard exported successfully!" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const exportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(buildApiUrl("/api/members?limit=1000"), {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      const contacts: Contact[] = data.members || [];

      const headers = ["Name", "Email", "Phone", "Address", "Role"];
      const rows = contacts.map(c => [
        `${c.firstName} ${c.lastName}`.trim(),
        c.email,
        c.phone || "",
        c.address || "",
        c.role,
      ]);

      const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "CSV exported successfully!" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Contact Directory Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Export church member contacts for emergency use.
        </p>
        <div className="flex gap-2">
          <Button onClick={exportVCard} disabled={isExporting} variant="outline" className="flex-1">
            <FileJson className="mr-2 h-4 w-4" />
            Export VCF
          </Button>
          <Button onClick={exportCSV} disabled={isExporting} variant="outline" className="flex-1">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
