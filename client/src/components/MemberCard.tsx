"use client";

import { Mail, Phone, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MemberCardProps {
  name: string;
  email: string;
  phone?: string;
  birthday?: string;
  address?: string;
  profileImage?: string;
  onMessage?: () => void;
  onViewAttendance?: () => void;
}

export function MemberCard({ name, email, phone, birthday, address, profileImage, onMessage, onViewAttendance }: MemberCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-primary/20 to-accent/20" />
      <CardContent className="pt-0">
        <div className="relative -mt-10 mb-4">
          <img 
            src={profileImage || "/default-avatar.png"} 
            alt={name}
            className="w-20 h-20 rounded-full border-4 border-background object-cover"
          />
        </div>
        
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{email}</p>
        
        <div className="space-y-2 text-sm">
          {phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{phone}</span>
            </div>
          )}
          {birthday && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{birthday}</span>
            </div>
          )}
          {address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{address}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          {onMessage && (
            <Button variant="outline" size="sm" onClick={onMessage}>
              <Mail className="w-4 h-4 mr-1" />
              Message
            </Button>
          )}
          {onViewAttendance && (
            <Button variant="outline" size="sm" onClick={onViewAttendance}>
              <Calendar className="w-4 h-4 mr-1" />
              Attendance
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
