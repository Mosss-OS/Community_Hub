import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

const THEMES = [
  { id: "default", name: "Default", primary: "#4f46e5", secondary: "#f59e0b" },
  { id: "ocean", name: "Ocean", primary: "#0ea5e9", secondary: "#06b6d4" },
  { id: "forest", name: "Forest", primary: "#16a34a", secondary: "#22c55e" },
  { id: "sunset", name: "Sunset", primary: "#ea580c", secondary: "#f97316" },
  { id: "royal", name: "Royal", primary: "#7c3aed", secondary: "#a78bfa" },
];

export function ThemeCustomizer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Admin Theme Customizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Customize admin dashboard colors.</p>
        <div className="grid grid-cols-5 gap-2">
          {THEMES.map(t => (
            <button key={t.id} className="p-3 rounded-lg border-2 hover:scale-105 transition-transform" style={{ borderColor: t.primary }}>
              <div className="w-full h-6 rounded" style={{ background: `linear-gradient(to right, ${t.primary}, ${t.secondary})` }} />
              <p className="text-xs mt-1">{t.name}</p>
            </button>
          ))}
        </div>
        <Button className="w-full">Apply Theme</Button>
      </CardContent>
    </Card>
  );
}
