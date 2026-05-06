import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuMapPin, LuNavigation } from 'react-icons/lu';

const MAP_MARKERS = [
  { id: 1, name: "Main Sanctuary", x: 50, y: 30, type: "building" },
  { id: 2, name: "Parking Lot A", x: 20, y: 60, type: "parking" },
  { id: 3, name: "Parking Lot B", x: 80, y: 70, type: "parking" },
  { id: 4, name: "Youth Hall", x: 60, y: 50, type: "building" },
  { id: 5, name: "Main Entrance", x: 50, y: 85, type: "entrance" },
  { id: 6, name: "Fellowship Hall", x: 30, y: 40, type: "building" },
];

export function InteractiveMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Interactive Church Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-green-50 rounded-lg h-64 border">
          {MAP_MARKERS.map(m => (
            <div
              key={m.id}
              className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-primary text-white flex items-center justify-center text-xs cursor-pointer hover:scale-125 transition-transform"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              title={m.name}
            >
              {m.type === "parking" ? "P" : m.type === "entrance" ? "E" : "B"}
            </div>
          ))}
          <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs">
            <p><span className="inline-block w-3 h-3 bg-primary rounded-full mr-1"></span> Building</p>
            <p><span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Parking</p>
            <p><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> Entrance</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4" onClick={() => window.open("https://maps.google.com")}>
          <Navigation className="mr-2 h-4 w-4" />
          Open in Google Maps
        </Button>
      </CardContent>
    </Card>
  );
}
