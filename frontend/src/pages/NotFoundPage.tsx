import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NotFoundPage() {
  return (
    <Card>
      <CardHeader>
        <Badge variant="destructive" className="w-fit">404</Badge>
        <CardTitle>Page not found</CardTitle>
        <CardDescription>The page you requested does not exist.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
