import { useState } from "react";
import { Link } from "wouter";
import { HiChevronLeft, HiChevronRight, HiPlus } from "react-icons/hi";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date.startsWith(dateStr));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-lg">
          <HiChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold">
          {monthNames[month]} {year}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-lg">
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b text-center py-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-xs text-muted-foreground font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {blanks.map(i => (
          <div key={`blank-${i}`} className="min-h-[100px] border" />
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          return (
            <div key={day} className="min-h-[100px] border p-2 hover:bg-muted/50">
              <div className="text-sm font-medium mb-1">{day}</div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="w-full text-left text-xs bg-primary/10 text-primary px-1 py-0.5 rounded truncate"
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}