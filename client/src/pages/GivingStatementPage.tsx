import { useState } from "react";
import { useDonationHistory, useDonationStatement } from "@/hooks/use-donation-statement";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LuDownload, LuFileText, LuLoader2 } from 'react-icons/lu';
import { jsPDF } from "jspdf";
import { Helmet } from "react-helmet-async";

export default function GivingStatementPage() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: donations, isLoading } = useDonationHistory(selectedYear);
  const { data: statement, isLoading: statementLoading } = useDonationStatement(selectedYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const totalAmount = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;

  const generatePDF = () => {
    if (!donations || !user) return;

    const doc = new jsPDF();
    const orgName = "Community Hub Church";
    
    doc.setFontSize(20);
    doc.text("Annual Giving Statement", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`${orgName}`, 105, 30, { align: "center" });
    doc.text(`Tax Year: ${selectedYear}`, 105, 37, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Generated for: ${user.firstName} ${user.lastName}`, 20, 50);
    doc.text(`Email: ${user.email}`, 20, 56);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 62);
    
    const tableData = donations.map((d) => [
      new Date(d.createdAt).toLocaleDateString(),
      `$${d.amount.toFixed(2)}`,
      d.currency,
      d.isAnonymous ? "Anonymous" : d.donorName || "N/A",
      d.message || "",
    ]);

    let yPos = 70;
    tableData.forEach((row, index) => {
      yPos = 70 + (index + 1) * 10;
      doc.text(row[0], 20, yPos);
      doc.text(row[1], 70, yPos);
      doc.text(row[2], 120, yPos);
      doc.text(row[3], 150, yPos);
    });

    const finalY = yPos;
    doc.setFontSize(12);
    doc.text(`Total Donations: $${totalAmount.toFixed(2)}`, 20, finalY + 15);
    doc.text(`Number of Donations: ${donations.length}`, 20, finalY + 22);
    
    doc.save(`giving-statement-${selectedYear}.pdf`);
  };

  return (
    <>
      <Helmet>
        <title>Giving Statement - Community Hub</title>
      </Helmet>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Giving Statement</h1>
            <p className="text-muted-foreground">Generate your annual tax-deductible giving statement</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={generatePDF} disabled={!donations || donations.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Number of Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{donations?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tax Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedYear}</div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : donations && donations.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>${donation.amount.toFixed(2)}</TableCell>
                      <TableCell>{donation.currency}</TableCell>
                      <TableCell>{donation.isAnonymous ? "Anonymous" : donation.donorName || "N/A"}</TableCell>
                      <TableCell>{donation.message || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No donations found for {selectedYear}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
