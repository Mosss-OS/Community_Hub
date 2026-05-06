import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

export default function EventFeedbackPage() {
  const [rating, setRating] = useState(0);
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Event Feedback</h1>
      <Card>
        <CardHeader><CardTitle>Sunday Service - May 4</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea id="feedback" placeholder="Share your thoughts..." />
          </div>
          <Button>Submit Feedback</Button>
        </CardContent>
      </Card>
    </div>
  );
}
