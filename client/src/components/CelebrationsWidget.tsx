import { useState, useEffect } from "react";
import { Link } from "wouter";
import { HiCake, HiHeart } from "react-icons/hi";

interface Celebration {
  id: string;
  name: string;
  type: "birthday" | "anniversary";
  date: string;
  image?: string;
}

export function CelebrationsWidget() {
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);

  useEffect(() => {
    // Mock data - replace with API call
    const mockCelebrations: Celebration[] = [
      { id: "1", name: "John Doe", type: "birthday", date: "May 2" },
      { id: "2", name: "Jane Smith", type: "anniversary", date: "May 3" },
      { id: "3", name: "Mike Johnson", type: "birthday", date: "May 5" },
    ];
    setCelebrations(mockCelebrations);
  }, []);

  if (celebrations.length === 0) return null;

  const birthdays = celebrations.filter(c => c.type === "birthday");
  const anniversaries = celebrations.filter(c => c.type === "anniversary");

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="font-semibold mb-4">This Week's Celebrations</h3>
      
      <div className="space-y-3">
        {birthdays.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <HiCake className="w-4 h-4" />
              <span>Birthdays</span>
            </div>
            {birthdays.map(person => (
              <div key={person.id} className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                  <span className="text-xs">🎂</span>
                </div>
                <span>{person.name}</span>
                <span className="text-muted-foreground">{person.date}</span>
              </div>
            ))}
          </div>
        )}

        {anniversaries.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <HiHeart className="w-4 h-4" />
              <span>Anniversaries</span>
            </div>
            {anniversaries.map(person => (
              <div key={person.id} className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs">❤️</span>
                </div>
                <span>{person.name}</span>
                <span className="text-muted-foreground">{person.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}