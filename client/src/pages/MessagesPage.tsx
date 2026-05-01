import { useState } from "react";
import { useMyMessages, useMarkAsRead, useUnreadCount, useReplyToMessage } from "@/hooks/use-messages";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Bell, Send, Reply, Check, CheckCheck } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { data: messages, isLoading } = useMyMessages();
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const replyToMessage = useReplyToMessage();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();

  const filteredMessages = messages?.filter(msg => 
    filter === "unread" ? !msg.isRead : true
  ) || [];

  const handleMessageClick = (message: any) => {
    if (!message.isRead) {
      markAsRead.mutate(message.id);
    }
    setSelectedMessage(message);
    setReplyContent("");
    setIsReplying(false);
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedMessage) return;

    try {
      await replyToMessage.mutateAsync({
        messageId: selectedMessage.id,
        content: replyContent
      });
      toast({ title: "Reply sent", description: "Your response has been sent." });
      setReplyContent("");
      setIsReplying(false);
    } catch (err) {
      toast({ title: "Failed to send reply", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <Helmet>
        <title>Messages | Watchman Lekki</title>
      </Helmet>

      <div className="container px-4 md:px-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-500">Updates from your pastors and church leaders</p>
          </div>
          {unreadCount?.count ? (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full">
              <Bell className="h-4 w-4" />
              <span className="font-semibold">{unreadCount.count} unread</span>
            </div>
          ) : null}
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              All Messages
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Unread ({unreadCount?.count || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">
                    {filter === "unread" ? "No unread messages." : "No messages yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <Card 
                    key={message.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      message.isRead ? 'border-gray-100' : 'border-l-4 border-l-primary bg-primary/5'
                    }`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{message.title}</CardTitle>
                          {message.isRead ? (
                            <CheckCheck className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Check className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {message.priority === 'high' && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Urgent</span>
                          )}
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-2 mb-3">{message.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{format(new Date(message.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{message.type.toLowerCase().replace('_', ' ')}</span>
                          {message.isRead && message.readAt && (
                            <span className="text-blue-500">• Read {formatDistanceToNow(new Date(message.readAt), { addSuffix: true })}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMessage(null)}>
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {selectedMessage.priority === 'high' && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Urgent</span>
                  )}
                  <CardTitle>{selectedMessage.title}</CardTitle>
                  {selectedMessage.isRead ? (
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Check className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{format(new Date(selectedMessage.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                  {selectedMessage.isRead && selectedMessage.readAt && (
                    <span className="text-blue-500 flex items-center gap-1">
                      <CheckCheck className="h-3 w-3" />
                      Read {formatDistanceToNow(new Date(selectedMessage.readAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                {isReplying ? (
                  <div className="mt-4 space-y-3">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => { setIsReplying(false); setReplyContent(""); }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleReply}
                        disabled={!replyContent.trim() || replyToMessage.isPending}
                      >
                        {replyToMessage.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setIsReplying(true)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
                      Close
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
