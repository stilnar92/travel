import { Button } from "@/shared/ui/buttons/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/data-display/card";
import { Badge } from "@/shared/ui/data-display/badge";
import { Text } from "@/shared/ui/data-display/text";
import { Stack } from "@/shared/ui/layout/stack";
import { Grid } from "@/shared/ui/layout/grid";
import { Plus } from "lucide-react";

export default function VendorsPage() {
  return (
    <Stack gap="lg">
      <Stack direction="row" justify="between" align="center">
        <Text as="h1" size="3xl" weight="bold">
          Vendors
        </Text>
        <Button>
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </Stack>

      <Grid colsMd={2} colsLg={3}>
        <Card>
          <CardHeader>
            <CardTitle>The Ritz Paris</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap="sm">
              <Text color="muted">Paris, France</Text>
              <Stack direction="row" gap="xs" className="flex-wrap">
                <Badge>Luxury Hotel</Badge>
                <Badge variant="secondary">5 Star</Badge>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tokyo Adventures</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap="sm">
              <Text color="muted">Tokyo, Japan</Text>
              <Stack direction="row" gap="xs" className="flex-wrap">
                <Badge>Tour Operator</Badge>
                <Badge variant="outline">Local Guide</Badge>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alpine Express</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap="sm">
              <Text color="muted">Zurich, Switzerland</Text>
              <Stack direction="row" gap="xs" className="flex-wrap">
                <Badge>Transportation</Badge>
                <Badge variant="destructive">Premium</Badge>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Stack>
  );
}
