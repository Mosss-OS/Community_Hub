import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuMapPin, LuNavigation } from "react-icons/lu";
import { Button } from "@/components/ui/button";

export function ChurchMap() {
  const address = "123 Church Street, Lekki, Lagos, Nigeria";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="text-red-500" />
          Church Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <p className="text-gray-500">Map placeholder - integrate Google Maps or similar</p>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{address}</p>
        <Button
          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`)}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Get Directions
        </Button>
      </CardContent>
    </Card>
  );
}
