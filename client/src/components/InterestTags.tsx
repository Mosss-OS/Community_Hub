import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LuTags, LuPlus, LuX } from 'react-icons/lu';
import { useToast } from "@/components/ui/use-toast";
import { buildApiUrl } from "@/lib/api-config";

const AVAILABLE_TAGS = [
  "Music", "Tech", "Hospitality", "Teaching", "Evangelism", "Children Ministry",
  "Youth Ministry", "Worship", "Prayer", "Missions", "Discipleship", "Outreach",
  "Administration", "Finance", "Media", "Sound", "Security", "Ushering", "Choir",
  "Drama", "Dance", "Sports", "Cooking", "Crafts", "Photography", "Writing",
];

export function InterestTags({ userId, initialTags = [] }: { userId?: string; initialTags?: string[] }) {
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const saveTags = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(buildApiUrl("/api/members/interest-tags"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tags: selectedTags }),
      });

      if (response.ok) {
        toast({ title: "Interest tags saved successfully!" });
        setIsEditing(false);
      } else {
        toast({ title: "Failed to save tags", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving tags", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            Interest Tags
          </div>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-primary" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveTags} disabled={isSaving} size="sm">
                {isSaving ? "Saving..." : "Save Tags"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {selectedTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interest tags yet. Click + to add tags.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
