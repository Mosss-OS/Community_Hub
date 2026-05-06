import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuMapPin, LuNavigation, LuPhone, LuClock } from "react-icons/lu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const locations = [
  { name: "Main Campus", address: "123 Church Street, Lekki, Lagos", lat: 6.4698, lng: 3.5852, phone: "+234 123 456 7890", services: ["Sunday 8AM & 9AM", "Wednesday 6PM"] },
  { name: "Youth Center", address: "456 Youth Avenue, Lekki, Lagos", lat: 6.4705, lng: 3.5860, phone: "+234 123 456 7891", services: ["Friday 7PM", "Youth Programs"] },
  { name: "House Fellowships", address: "Various Locations", lat: 6.4698, lng: 3.5852, phone: "+234 123 456 7892", services: ["Weekly Meetings", "Small Groups"] },
];

export default function ChurchMapPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <MapPin className="text-primary" />
        Church Locations
      </h1>
      <p className="text-muted-foreground">Find us and join our services</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <MapPin className="h-12 w-12 text-primary mx-auto" />
            <p className="text-gray-500">Interactive map integration needed</p>
            <p className="text-sm text-gray-400">Integrate Google Maps or similar service</p>
          </div>
        </div>

        <div className="space-y-4">
          {locations.map((loc, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {loc.name}
                </CardTitle>
                <CardDescription>{loc.address}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {loc.phone}
                </div>
                <div className="space-y-1">
                  {loc.services.map((s, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`)}
                >
                  <Navigation className="mr-2 h-3 w-3" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
