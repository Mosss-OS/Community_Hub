import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function MemberDirectoryFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> Member Directory Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Search by name, email, phone..." />
        <Select>
          <SelectTrigger><SelectValue placeholder="Filter by Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger><SelectValue placeholder="Filter by House Fellowship" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fellowships</SelectItem>
            <SelectItem value="north">North Fellowship</SelectItem>
            <SelectItem value="south">South Fellowship</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full">Apply Filters</Button>
      </CardContent>
    </Card>
  );
}
