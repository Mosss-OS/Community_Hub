import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuUsers, LuHeart, LuMusic, LuBook, LuUser, LuSchool } from "react-icons/lu";
import { useState } from "react";

const ministries = [
  { id: 1, name: "Worship Team", description: "Leading the congregation in worship", icon: <LuMusic className="h-6 w-6" />, members: 12, leader: "Jane Smith" },
  { id: 2, name: "Youth Ministry", description: "Disciplining the next generation", icon: <LuSchool className="h-6 w-6" />, members: 45, leader: "Mike Johnson" },
  { id: 3, name: "Children's Church", description: "Teaching kids about Jesus", icon: <LuUser className="h-6 w-6" />, members: 30, leader: "Sarah Williams" },
  { id: 4, name: "Prayer Ministry", description: "Interceding for the church and community", icon: <LuHeart className="h-6 w-6" />, members: 20, leader: "David Brown" },
  { id: 5, name: "Bible Study", description: "Digging deeper into God's word", icon: <LuBook className="h-6 w-6" />, members: 35, leader: "Pastor Tom" },
];

export default function MinistryTeamsPage() {
  const [selectedMinistry, setSelectedMinistry] = useState<number | null>(null);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="text-primary" />
        Ministry Teams
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ministries.map((ministry) => (
          <Card 
            key={ministry.id} 
            className={`cursor-pointer transition-all ${selectedMinistry === ministry.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedMinistry(ministry.id === selectedMinistry ? null : ministry.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                {ministry.icon}
                <div>
                  <CardTitle className="text-lg">{ministry.name}</CardTitle>
                  <CardDescription>{ministry.leader}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{ministry.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{ministry.members} members</Badge>
                <Button size="sm" variant="outline">Join Team</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMinistry && (
        <Card>
          <CardHeader>
            <CardTitle>Ministry Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Upcoming Meetings</h3>
                <div className="space-y-2 text-sm">
                  <p>• Every Tuesday at 7:00 PM</p>
                  <p>• Special event: June 15, 2026</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Requirements</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Be a committed member for 3+ months</p>
                  <p>• Complete ministry training</p>
                  <p>• Agree to ministry covenant</p>
                </div>
              </div>
              <Button>Apply to Join</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
