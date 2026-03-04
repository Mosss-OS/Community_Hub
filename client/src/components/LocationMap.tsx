import { useBranding } from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Phone } from "lucide-react";

interface LocationMapProps {
  className?: string;
}

export function LocationMap({ className = "" }: LocationMapProps) {
  const { data: branding } = useBranding();
  
  const churchName = branding?.churchName || "Watchman Catholic Charismatic Renewal Movement, Lagos";
  const address = branding?.churchAddress || "7 Silverbird Road, Jakande First Gate, Lekki, Lagos State, Nigeria";
  const phone = branding?.churchPhone || "+2348000000000";
  
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed&iwloc=near`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className={`w-full ${className} bg-white`}>
      <div className="container px-6 md:px-10 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Visit Our Church
          </h2>
          <p className="text-gray-500 text-lg">
            Join us for worship and fellowship. We'd love to welcome you to our community.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <iframe
            src={mapEmbedUrl}
            className="w-full h-96 md:h-[500px] border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Church Location"
          />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-lg px-10 py-5 w-full sm:w-auto"
          >
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="w-6 h-6 mr-3" />
              Get Directions
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-lg px-10 py-5 w-full sm:w-auto"
          >
            <a href={`tel:${phone}`}>
              <Phone className="w-6 h-6 mr-3" />
              Call Church
            </a>
          </Button>
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            {address}
          </p>
        </div>
      </div>
    </div>
  );
}
