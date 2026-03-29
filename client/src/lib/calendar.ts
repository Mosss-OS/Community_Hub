export function generateICalEvent(event: {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
}): string {
  const formatDate = (date: Date) => 
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CHub//Church Community Platform//EN
BEGIN:VEVENT
UID:${crypto.randomUUID()}@chub
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
${event.endDate ? `DTEND:${formatDate(event.endDate)}` : ""}
SUMMARY:${event.title}
${event.description ? `DESCRIPTION:${event.description}` : ""}
${event.location ? `LOCATION:${event.location}` : ""}
END:VEVENT
END:VCALENDAR`.trim();
}

export function downloadICalFile(event: {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
}) {
  const icalContent = generateICalEvent(event);
  const blob = new Blob([icalContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/\s+/g, "-")}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
