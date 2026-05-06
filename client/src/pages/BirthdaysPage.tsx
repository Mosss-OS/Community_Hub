import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuCake, LuGift } from "react-icons/lu";

export default function BirthdaysPage() {
  const birthdays = [
    { name: "Sarah Johnson", date: "May 15", daysUntil: 9 },
    { name: "Michael Chen", date: "May 22", daysUntil: 16 },
    { name: "Grace Williams", date: "June 3", daysUntil: 28 },
  ];

  const anniversaries = [
    { name: "John & Mary Smith", date: "May 20", years: 5 },
    { name: "David & Lisa Brown", date: "June 10", years: 3 },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Birthdays & Anniversaries</h1>

      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Cake className="text-pink-500" />
          Upcoming Birthdays
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {birthdays.map((person, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{person.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{person.date}</p>
                <p className="text-sm text-pink-600">{person.daysUntil} days until celebration</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <Gift className="mr-2 h-4 w-4" />
                  Send Wishes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Anniversaries</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {anniversaries.map((couple, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{couple.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{couple.date}</p>
                <p className="text-sm text-blue-600">{couple.years} years together</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
