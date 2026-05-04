import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trophy } from "lucide-react";
import { jsPDF } from "jspdf";

interface Certificate {
  id: string;
  seriesName: string;
  completedDate: string;
  sermonsWatched: number;
  totalSermons: number;
}

export function SermonCertificate({ userId }: { userId?: string }) {
  const certificates: Certificate[] = [
    { id: "1", seriesName: "Faith Foundations", completedDate: "2026-04-15", sermonsWatched: 8, totalSermons: 8 },
    { id: "2", seriesName: "Prayer Warfare", completedDate: "2026-03-20", sermonsWatched: 6, totalSermons: 6 },
  ];

  const downloadCertificate = (cert: Certificate) => {
    const doc = new jsPDF();
    doc.setFontSize(30);
    doc.text("Certificate of Completion", 105, 50, { align: "center" });
    doc.setFontSize(16);
    doc.text(`Awarded to: ${userId || "Member"}`, 105, 80, { align: "center" });
    doc.setFontSize(14);
    doc.text(`For completing the "${cert.seriesName}" series`, 105, 100, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Watched ${cert.sermonsWatched}/${cert.totalSermons} sermons`, 105, 120, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Completed on: ${cert.completedDate}`, 105, 140, { align: "center" });
    doc.save(`certificate-${cert.seriesName.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-600" /> Sermon Series Certificates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {certificates.map(cert => (
          <div key={c.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">{cert.seriesName}</p>
              <p className="text-sm text-muted-foreground">Completed {cert.completedDate}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadCertificate(cert)}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
