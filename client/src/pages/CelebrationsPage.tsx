import { useState, useEffect } from "react";
import { Link } from "wouter";
import { HiCake, HiHeart } from "react-icons/hi";
import { PageSEO } from "@/components/PageSEO";

interface Celebration {
  id: string;
  firstName: string;
  lastName: string;
  type: "birthday" | "anniversary";
  date: string;
  image?: string;
}

export default function CelebrationsPage() {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockCelebrations: Celebration[] = [
      { id: "1", firstName: "John", lastName: "Doe", type: "birthday", date: "May 2" },
      { id: "2", firstName: "Jane", lastName: "Smith", type: "anniversary", date: "May 3" },
      { id: "3", firstName: "Mike", lastName: "Johnson", type: "birthday", date: "May 5" },
      { id: "4", firstName: "Sarah", lastName: "Williams", type: "birthday", date: "May 7" },
      { id: "5", firstName: "David", lastName: "Brown", type: "anniversary", date: "May 10" },
    ];
    setCelebrations(mockCelebrations);
    setLoading(false);
  }, []);

  const birthdays = celebrations.filter(c => c.type === "birthday");
  const anniversaries = celebrations.filter(c => c.type === "anniversary");

  return (
    <>
      <PageSEO title="Celebrations | Watchman Lekki" description="Birthdays and anniversaries" />
      
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">Celebrations</h1>
        <p className="text-muted-foreground mb-8">Celebrate birthdays and wedding anniversaries</p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Birthdays */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HiCake className="w-6 h-6 text-pink-500" />
                <h2 className="text-xl font-semibold">Birthdays This Month</h2>
              </div>
              <div className="space-y-3">
                {birthdays.map(person => (
                  <div key={person.id} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                      <span className="text-xl">🎂</span>
                    </div>
                    <div>
                      <p className="font-medium">{person.firstName} {person.lastName}</p>
                      <p className="text-sm text-muted-foreground">{person.date}</p>
                    </div>
                  </div>
                ))}
                {birthdays.length === 0 && (
                  <p className="text-muted-foreground">No birthdays this month</p>
                )}
              </div>
            </div>

            {/* Anniversaries */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HiHeart className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold">Anniversaries This Month</h2>
              </div>
              <div className="space-y-3">
                {anniversaries.map(person => (
                  <div key={person.id} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-xl">❤️</span>
                    </div>
                    <div>
                      <p className="font-medium">{person.firstName} {person.lastName}</p>
                      <p className="text-sm text-muted-foreground">{person.date}</p>
                    </div>
                  </div>
                ))}
                {anniversaries.length === 0 && (
                  <p className="text-muted-foreground">No anniversaries this month</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}