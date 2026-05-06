import { LuClock, LuMapPin } from 'react-icons/lu';

interface ServiceTime {
  day: string;
  time: string;
  name?: string;
}

interface ServiceTimesProps {
  services: ServiceTime[];
}

export function ServiceTimes({ services }: ServiceTimesProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Service Times
      </h3>
      <div className="grid gap-2">
        {services.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">{service.day}</span>
            <span className="text-muted-foreground">{service.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
