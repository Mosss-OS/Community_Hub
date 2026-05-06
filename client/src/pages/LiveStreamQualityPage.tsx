import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LuSettings } from "react-icons/lu";

export default function LiveStreamQualityPage() {
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Settings className="text-primary" />
        Livestream Quality
      </h1>
      <Card>
        <CardHeader><CardTitle>Quality Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-2">Default Quality</p>
            <Select defaultValue="720p">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="480p">480p (SD)</SelectItem>
                <SelectItem value="720p">720p (HD)</SelectItem>
                <SelectItem value="1080p">1080p (Ful HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
