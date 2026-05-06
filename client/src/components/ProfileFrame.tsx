import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuImage, LuCheck } from 'react-icons/lu';
import { useToast } from "@/hooks/use-toast";
import { buildApiUrl } from "@/lib/api-config";

const FRAMES = [
  { id: "default", name: "Default", color: "bg-gray-200", border: "border-2 border-gray-300" },
  { id: "gold", name: "Gold", color: "bg-yellow-100", border: "border-2 border-yellow-400" },
  { id: "rose", name: "Rose", color: "bg-rose-100", border: "border-2 border-rose-400" },
  { id: "blue", name: "Ocean", color: "bg-blue-100", border: "border-2 border-blue-400" },
  { id: "green", name: "Forest", color: "bg-green-100", border: "border-2 border-green-400" },
  { id: "purple", name: "Royal", color: "bg-purple-100", border: "border-2 border-purple-400" },
  { id: "christmas", name: "Christmas", color: "bg-red-100", border: "border-2 border-red-400", emoji: "🎄" },
  { id: "easter", name: "Easter", color: "bg-pink-100", border: "border-2 border-pink-400", emoji: "🌷" },
  { id: "thanksgiving", name: "Thanksgiving", color: "bg-orange-100", border: "border-2 border-orange-400", emoji: "🦃" },
];

interface UserProfile {
  profileFrame?: string;
  profileImage?: string | null;
}

export function ProfileFrame({ userId, profile }: { userId?: string; profile?: UserProfile }) {
  const { toast } = useToast();
  const [selectedFrame, setSelectedFrame] = useState(profile?.profileFrame || "default");
  const [isSaving, setIsSaving] = useState(false);

  const saveFrame = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(buildApiUrl("/api/members/profile-frame"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profileFrame: selectedFrame }),
      });

      if (response.ok) {
        toast({ title: "Profile frame updated!" });
      } else {
        toast({ title: "Failed to save frame", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving frame", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const frame = FRAMES.find(f => f.id === selectedFrame) || FRAMES[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Custom Profile Frame
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className={`w-32 h-32 rounded-full ${frame.color} ${frame.border} flex items-center justify-center relative`}>
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt="Profile" className="w-28 h-28 rounded-full object-cover" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            )}
            {frame.emoji && (
              <div className="absolute -bottom-1 -right-1 text-2xl">{frame.emoji}</div>
            )}
          </div>
        </div>

        <div>
          <Select value={selectedFrame} onValueChange={setSelectedFrame}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FRAMES.map(f => (
                <SelectItem key={f.id} value={f.id}>
                  {f.emoji} {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={saveFrame} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Frame"}
        </Button>
      </CardContent>
    </Card>
  );
}
