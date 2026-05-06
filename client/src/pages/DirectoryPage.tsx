import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LuUsers, LuSearch, LuPhone, LuMail, LuMapPin } from "react-icons/lu";
import { useState } from "react";

const members = [
  { id: 1, name: "John Doe", role: "Member", phone: "555-0100", email: "john@example.com", joinDate: "2024-01-15" },
  { id: 2, name: "Sarah Miller", role: "Deacon", phone: "555-0101", email: "sarah@example.com", joinDate: "2023-06-20" },
  { id: 3, name: "Mike Johnson", role: "Elder", phone: "555-0102", email: "mike@example.com", joinDate: "2022-03-10" },
  { id: 4, name: "Emily Davis", role: "Member", phone: "555-0103", email: "emily@example.com", joinDate: "2024-09-05" },
];

export default function DirectoryPage() {
  const [search, setSearch] = useState("");

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="text-primary" />
        Church Directory
      </h1>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search members..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Export</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>Member since {member.joinDate}</CardDescription>
                </div>
                <Badge variant={member.role === "Elder" ? "default" : member.role === "Deacon" ? "secondary" : "outline"}>
                  {member.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {member.phone}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
