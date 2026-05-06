import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LuNotebook, LuSave, LuShare2 } from "react-icons/lu";
import { useState } from "react";

export default function SermonNotesPage() {
  const [note, setNote] = useState("");
  const [sermonTitle, setSermonTitle] = useState("Sunday Service - May 4");

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Notebook className="text-primary" />
        Sermon Notes
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Sermon</CardTitle>
          <CardDescription>{sermonTitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Your Notes</Label>
            <Textarea
              id="notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Take notes during the sermon..."
              rows={10}
            />
          </div>
          <div className="flex gap-2">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Notes
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Previous Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Sunday Service - Apr 27</p>
              <p className="text-sm text-muted-foreground mt-1">The parable of the sower...</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Sunday Service - Apr 20</p>
              <p className="text-sm text-muted-foreground mt-1">Faith without works is dead...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
