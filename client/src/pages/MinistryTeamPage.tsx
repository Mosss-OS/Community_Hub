import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuUsers, LuHeart, LuMusic, LuBookOpen } from "react-icons/lu";
import { Button } from "@/components/ui/button";

const teams = [
  { name: "Worship Team", description: "Leading the congregation in worship", icon: LuMusic, members: 12 },
  { name: "Prayer Team", description: "Interceding for the church and community", icon: LuHeart, members: 8 },
  { name: "Welcome Team", description: "Greeting and welcoming newcomers", icon: LuUsers, members: 15 },
  { name: "Bible Study", description: "Teaching and studying God's word", icon: LuBookOpen, members: 20 },
];

export default function MinistryTeamPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Ministry Teams</h1>
      <p className="text-muted-foreground">Discover and join our ministry teams</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <team.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{team.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{team.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{team.members} members</span>
                <Button size="sm">Join Team</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
