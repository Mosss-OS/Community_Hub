import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuFilter } from "react-icons/lu";

export default function MemberDirectoryFiltersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Filter className="text-primary" />
        Member Directory Filters
      </h1>
      <Card>
        <CardHeader><CardTitle>Filter Options</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Add filters for member directory search</p>
          <Button>Add Filter</Button>
        </CardContent>
      </Card>
    </div>
  );
}
