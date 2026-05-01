import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail, Phone } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

const defaultStaff: StaffMember[] = [
  { id: "1", name: "Pastor John Doe", role: "Senior Pastor", image: "/church_building.avif", email: "pastor@watchmanlekki.org" },
  { id: "2", name: "Jane Smith", role: "Worship Lead", image: "/church_building.avif", email: "jane@watchmanlekki.org" },
  { id: "3", name: "Michael Johnson", role: "Youth Pastor", image: "/church_building.avif", email: "michael@watchmanlekki.org" },
  { id: "4", name: "Grace Williams", role: "Children's Pastor", image: "/church_building.avif", email: "grace@watchmanlekki.org" },
];

export function StaffDirectory() {
  const [staff] = useState<StaffMember[]>(defaultStaff);

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {staff.map((member) => (
        <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-square bg-gray-200 flex items-center justify-center">
            {member.image ? (
              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <Users className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
            <p className="text-muted-foreground text-sm mb-3">{member.role}</p>
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-1 text-sm text-primary hover:underline mb-2">
                <Mail className="w-3 h-3" />
                {member.email}
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
                <Phone className="w-3 h-3" />
                {member.phone}
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StaffDirectoryPage() {
  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Church Staff Directory</h1>
          <p className="text-muted-foreground mb-8">Meet our dedicated church staff team</p>
          <StaffDirectory />
        </div>
      </div>
    </>
  );
}
