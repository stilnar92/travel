import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Plus } from "lucide-react";

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <Button>
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>The Ritz Paris</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">Paris, France</p>
            <div className="flex flex-wrap gap-2">
              <Badge>Luxury Hotel</Badge>
              <Badge variant="secondary">5 Star</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tokyo Adventures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">Tokyo, Japan</p>
            <div className="flex flex-wrap gap-2">
              <Badge>Tour Operator</Badge>
              <Badge variant="outline">Local Guide</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alpine Express</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">Zurich, Switzerland</p>
            <div className="flex flex-wrap gap-2">
              <Badge>Transportation</Badge>
              <Badge variant="destructive">Premium</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
