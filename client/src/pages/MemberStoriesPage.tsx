import { useState } from "react";
import { PageSEO } from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LuMessageSquareQuote, LuHeart } from 'react-icons/lu';

interface Story {
  id: string;
  name: string;
  title: string;
  content: string;
  date: string;
  likes: number;
}

const mockStories: Story[] = [
  { id: "1", name: "John Doe", title: "How I Found My Faith", content: "I was searching for meaning in my life when I first visited Watchman Lekki. The warmth of the community and the powerful messages transformed my life...", date: "2026-04-15", likes: 24 },
  { id: "2", name: "Jane Smith", title: "Overcoming Anxiety Through Prayer", content: "Last year I struggled with severe anxiety. Through the prayer support group at Watchman, I learned to cast all my cares on God...", date: "2026-04-10", likes: 18 },
  { id: "3", name: "Michael Johnson", title: "From Addict to Worshiper", content: "I never thought I could break free from my addictions until I encountered the love of God at Watchman Lekki...", date: "2026-04-05", likes: 32 },
];

export default function MemberStoriesPage() {
  const [stories] = useState<Story[]>(mockStories);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    alert("Story submitted! (This is a demo)");
    setTitle("");
    setContent("");
    setShowForm(false);
  };

  return (
    <>
      <PageSEO title="Member Stories | Watchman Lekki" description="Read inspiring stories and testimonies from our church family" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Member Stories & Testimonies</h1>
            <p className="text-muted-foreground">Be encouraged by the amazing things God is doing in our church family</p>
          </div>

          <div className="mb-8 text-center">
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="rounded-2xl gradient-accent text-primary-foreground"
            >
              <MessageSquareQuote className="w-4 h-4 mr-2" />
              {showForm ? "Cancel" : "Share Your Story"}
            </Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Story Title</label>
                    <Input 
                      placeholder="Give your story a title..." 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Story</label>
                    <Textarea 
                      placeholder="Share your testimony or story..." 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={5}
                      className="rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="rounded-xl">Submit Story</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {stories.map((story) => (
              <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">{story.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{story.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">Shared by {story.name} on {new Date(story.date).toLocaleDateString()}</p>
                      <p className="text-foreground/80 mb-4">{story.content}</p>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>{story.likes} likes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
