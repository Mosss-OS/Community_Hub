"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { LuChevronLeft, LuChevronRight, LuUsers, LuCalendar } from 'react-icons/lu';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
  date: Date;
  present: number;
  absent: number;
  total: number;
}

interface AttendanceCalendarProps {
  records?: AttendanceRecord[];
  onDateClick?: (date: Date) => void;
}

export function AttendanceCalendar({ records = [], onDateClick }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAttendanceForDate = (date: Date) => {
    return records.find(r => isSameDay(r.date, date));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const startDay = monthStart.getDay();
  const blankDays = Array.from({ length: startDay }, (_, i) => i);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Attendance Calendar
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {blankDays.map(i => (
            <div key={`blank-${i}`} className="h-10" />
          ))}
          
          {days.map(day => {
            const attendance = getAttendanceForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const percentage = attendance ? (attendance.present / attendance.total) * 100 : 0;
            
            let bgColor = "bg-muted/30";
            if (percentage >= 90) bgColor = "bg-green-500/20";
            else if (percentage >= 70) bgColor = "bg-yellow-500/20";
            else if (percentage > 0) bgColor = "bg-red-500/20";
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`h-10 rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${bgColor} ${
                  isSelected ? "ring-2 ring-primary" : "hover:bg-muted"
                }`}
              >
                <span className="font-medium">{format(day, "d")}</span>
                {attendance && (
                  <span className="text-[10px] text-muted-foreground">
                    {attendance.present}/{attendance.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded bg-green-500/20" />
            <span>90%+</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded bg-yellow-500/20" />
            <span>70-89%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded bg-red-500/20" />
            <span>&lt;70%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AttendanceStatsProps {
  totalMembers: number;
  presentToday: number;
  averageAttendance: number;
  streak: number;
}

export function AttendanceStats({ totalMembers, presentToday, averageAttendance, streak }: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs">Total Members</span>
          </div>
          <p className="text-2xl font-bold">{totalMembers}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Present Today</span>
          </div>
          <p className="text-2xl font-bold">{presentToday}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">Average</span>
          </div>
          <p className="text-2xl font-bold">{averageAttendance}%</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-xs">Streak</span>
          </div>
          <p className="text-2xl font-bold">{streak} weeks</p>
        </CardContent>
      </Card>
    </div>
  );
}
