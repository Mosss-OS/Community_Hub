"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type?: "service" | "event" | "meeting" | "other";
  color?: string;
}

interface EventCalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function EventCalendar({ events = [], onDateClick, onEventClick }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventColor = (type?: string) => {
    switch (type) {
      case "service": return "bg-blue-500";
      case "event": return "bg-green-500";
      case "meeting": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {format(currentMonth, "MMMM yyyy")}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {weekDays.map(day => (
            <div key={day} className="bg-muted p-2 text-center text-xs font-medium">
              {day}
            </div>
          ))}
          
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`min-h-[80px] p-1 text-left transition-colors ${
                  !isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-background"
                } ${isSelected ? "ring-2 ring-primary" : ""} hover:bg-muted/50`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : ""
                }`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={`text-[10px] px-1 py-0.5 rounded truncate text-white cursor-pointer ${event.color || getEventColor(event.type)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface MiniCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
}

export function MiniCalendar({ selected, onSelect }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <span className="text-xs font-medium">{format(currentMonth, "MMM yyyy")}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-[10px]">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div key={i} className="text-center text-muted-foreground py-0.5">{day}</div>
        ))}
        {days.map(day => {
          const isSelected = selected && isSameDay(day, selected);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect?.(day)}
              className={`p-1 rounded text-center ${
                isSelected ? "bg-primary text-primary-foreground" : ""
              } ${isToday && !isSelected ? "ring-1 ring-primary" : ""} ${
                !isCurrentMonth ? "text-muted-foreground/50" : ""
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
