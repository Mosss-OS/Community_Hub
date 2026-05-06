import { LuFlame, LuTrophy, LuStar } from "react-icons/lu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityStreakProps {
  streak: number;
  badges: { name: string; description: string; earned: boolean }[];
}

export function ActivityStreak({ streak, badges }: ActivityStreakProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="text-orange-500" />
          Activity Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-orange-500">{streak}</p>
          <p className="text-sm text-muted-foreground">days in a row</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Achievement Badges
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`p-3 rounded-lg text-center ${
                  badge.earned ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 opacity-50"
                }`}
              >
                <Star className={`mx-auto mb-1 ${badge.earned ? "text-yellow-500" : "text-gray-400"}`} />
                <p className="text-xs font-medium">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
