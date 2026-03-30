"use client";

import { MapPin, Navigation, Car, Parking } from "lucide-react";

interface ChurchLocationProps {
  address: string;
  mapUrl?: string;
  parkingInfo?: string;
}

export function ChurchLocation({ address, mapUrl, parkingInfo }: ChurchLocationProps) {
  const openDirections = () => {
    const url = mapUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <h3 className="font-semibold">Location</h3>
          <p className="text-muted-foreground">{address}</p>
        </div>
      </div>
      
      <Button onClick={openDirections} className="w-full">
        <Navigation className="w-4 h-4 mr-2" />
        Get Directions
      </Button>
      
      {parkingInfo && (
        <div className="flex items-start gap-3 pt-2 border-t">
          <Car className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Parking className="w-4 h-4" />
              Parking
            </h4>
            <p className="text-sm text-muted-foreground">{parkingInfo}</p>
          </div>
        </div>
      )}
    </div>
  );
}
