import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function GroupDiscoveryPage() {
  const groups = [
    { id: "1", name: "Men's Fellowship", members: 45, category: "Men" },
    { id: "2", name: "Women's Bible Study", members: 32, category: "Women" },
    { id: "3", name: "Youth Group", members: 28, category: "Youth" },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Group Discovery</h1>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search groups..." className="pl-10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(g => (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle>{g.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{g.category}</p>
              <p className="text-sm mb-3">{g.members} members</p>
              <Button className="w-full">Join Group</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
