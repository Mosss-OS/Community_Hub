"use client";

import { useState } from "react";
import { Send, Image, Paperclip, MoreVertical, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
}

interface GroupChatProps {
  groupId: string;
  groupName: string;
  members: { id: string; name: string; avatar?: string }[];
  messages: Message[];
  currentUserId: string;
  onSendMessage?: (content: string) => void;
}

export function GroupChat({ groupName, members, messages, currentUserId, onSendMessage }: GroupChatProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage?.(newMessage);
      setNewMessage("");
    }
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {groupName}
          </CardTitle>
          <div className="flex -space-x-2">
            {members.slice(0, 3).map(member => (
              <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                +{members.length - 3}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => {
          const isOwn = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback>{message.senderName[0]}</AvatarFallback>
              </Avatar>
              <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                <div className={`inline-block px-4 py-2 rounded-lg ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.senderName} • {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon"><Image className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </Card>
  );
}
