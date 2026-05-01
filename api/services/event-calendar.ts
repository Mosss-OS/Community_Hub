import type { Event } from "../../shared/schema";

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  recurrenceRule?: string;
  recurrenceEndDate?: Date;
  virtualLink?: string;
}

function formatDateICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function generateICS(event: CalendarEvent): string {
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@communityhub`;
  const now = formatDateICS(new Date());
  
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Community Hub//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatDateICS(event.startDate)}`,
    event.endDate ? `DTEND:${formatDateICS(event.endDate)}` : null,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
    `LOCATION:${escapeICSText(event.location)}`,
    event.recurrenceRule ? `RRULE:${event.recurrenceRule}` : null,
    event.virtualLink ? `URL:${event.virtualLink}` : null,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  return ics;
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${formatDateICS(event.startDate)}/${formatDateICS(event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000))}`,
  });

  if (event.recurrenceRule) {
    params.append("recurrence", `RRULE:${event.recurrenceRule}`);
  }

  if (event.virtualLink) {
    params.append("details", `${event.description}\n\nJoin Link: ${event.virtualLink}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: event.startDate.toISOString(),
    enddt: (event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000)).toISOString(),
    allday: "false",
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function generateAppleCalendarUrl(event: CalendarEvent): string {
  const icsContent = generateICS(event);
  const encoded = btoa(unescape(encodeURIComponent(icsContent)));
  return `data:text/calendar;base64,${encoded}`;
}

export function generateYahooCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    title: event.title,
    desc: event.description,
    in_loc: event.location,
    dtstart: formatDateICS(event.startDate),
    dtend: formatDateICS(event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000)),
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

export function generateAllCalendarLinks(eventData: Event): {
  google: string;
  outlook: string;
  apple: string;
  yahoo: string;
  ics: string;
} {
  const event: CalendarEvent = {
    title: eventData.title,
    description: eventData.description,
    location: eventData.location,
    startDate: new Date(eventData.date),
    endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
    recurrenceRule: eventData.recurrenceRule || undefined,
    recurrenceEndDate: eventData.recurrenceEndDate ? new Date(eventData.recurrenceEndDate) : undefined,
    virtualLink: eventData.virtualLink || undefined,
  };

  return {
    google: generateGoogleCalendarUrl(event),
    outlook: generateOutlookCalendarUrl(event),
    apple: generateAppleCalendarUrl(event),
    yahoo: generateYahooCalendarUrl(event),
    ics: generateICS(event),
  };
}

export function parseRecurrenceRule(rule: string): {
  frequency: string;
  interval: number;
  daysOfWeek?: string[];
  endDate?: Date;
} | null {
  const parts = rule.split(";");
  const result: any = { frequency: "WEEKLY", interval: 1 };

  for (const part of parts) {
    const [key, value] = part.split("=");
    switch (key) {
      case "FREQ":
        result.frequency = value;
        break;
      case "INTERVAL":
        result.interval = parseInt(value, 10);
        break;
      case "BYDAY":
        result.daysOfWeek = value.split(",");
        break;
      case "UNTIL":
        result.endDate = new Date(value);
        break;
    }
  }

  return result;
}

export function generateRecurrenceDates(
  startDate: Date,
  rule: string,
  endDate?: Date,
  count?: number
): Date[] {
  const parsed = parseRecurrenceRule(rule);
  if (!parsed) return [startDate];

  const dates: Date[] = [];
  const maxCount = count || 52;
  const end = endDate || new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  
  let currentDate = new Date(startDate);
  let iterations = 0;

  while (currentDate <= end && iterations < maxCount) {
    dates.push(new Date(currentDate));
    
    switch (parsed.frequency) {
      case "DAILY":
        currentDate.setDate(currentDate.getDate() + parsed.interval);
        break;
      case "WEEKLY":
        currentDate.setDate(currentDate.getDate() + (7 * parsed.interval));
        break;
      case "MONTHLY":
        currentDate.setMonth(currentDate.getMonth() + parsed.interval);
        break;
      case "YEARLY":
        currentDate.setFullYear(currentDate.getFullYear() + parsed.interval);
        break;
      default:
        break;
    }
    iterations++;
  }

  return dates;
}
