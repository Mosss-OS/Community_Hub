import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LuBookOpen, LuHeart, LuMessageCircle, LuPlus, LuShare2 } from "react-icons/lu";
import { useState } from "react";

const testimonies = [
  { id: 1, title: "Healed from sickness", content: "God's mercy prevailed...", author: "Sarah M.", date: "2026-05-01", likes: 12, category: "Healing" },
  { id: 2, title: "Financial breakthrough", content: "After praying for 3 months...", author: "John D.", date: "2026-04-28", likes: 8, category: "Provision" },
  { id: 3, title: "Restored relationship", content: "My marriage was restored...", author: "Mike C.", date: "2026-04-25", likes: 15, category: "Relationships" },
];

export default function TestimoniesPage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="text-primary" />
          Testimonies
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Share Testimony
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Share Your Testimony</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Testimony title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Your Testimony</Label>
              <Textarea 
                id="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share how God has been faithful..."
                rows={5}
              />
            </div>
            <div className="flex gap-2">
              <Button>Submit Testimony</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {testimonies.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{t.title}</CardTitle>
                  <CardDescription>{t.author} • {t.date}</CardDescription>
                </div>
                <Badge>{t.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{t.content}</p>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <Heart className="mr-1 h-3 w-3" />
                  {t.likes} Likes
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="mr-1 h-3 w-3" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="mr-1 h-3 w-3" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
