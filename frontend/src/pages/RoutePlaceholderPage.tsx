import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type RoutePlaceholderPageProps = {
  title: string;
  description: string;
};

export function RoutePlaceholderPage({ title, description }: RoutePlaceholderPageProps) {
  return (
    <Card>
      <CardHeader>
        <Badge className="w-fit">Route skeleton</Badge>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="max-w-2xl leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed bg-muted px-4 py-3 text-sm text-muted-foreground">
          This screen is ready for feature implementation in a later task.
        </div>
      </CardContent>
    </Card>
  );
}
