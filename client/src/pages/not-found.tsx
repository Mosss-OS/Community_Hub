import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuAlertCircle, LuHome, LuArrowLeft, LuSearch } from 'react-icons/lu';
import { PageSEO } from "@/components/PageSEO";

export default function NotFound() {
  return (
    <>
      <PageSEO title="Page Not Found" description="The page you're looking for doesn't exist or has been moved." />
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-lg mx-4 shadow-xl">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
            <h2 className="text-xl font-semibold text-foreground mb-4">Page Not Found</h2>
            
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Button asChild className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link href="/search">
                  <Search className="h-4 w-4" />
                  Search
                </Link>
              </Button>
            </div>

            <div className="border-t pt-6 mt-6">
              <p className="text-sm text-muted-foreground mb-3">Need help? Try these links:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="link" asChild>
                  <Link href="/sermons">Sermons</Link>
                </Button>
                <Button variant="link" asChild>
                  <Link href="/events">Events</Link>
                </Button>
                <Button variant="link" asChild>
                  <Link href="/prayer">Prayer</Link>
                </Button>
                <Button variant="link" asChild>
                  <Link href="/give">Give</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function ErrorBoundary({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-lg mx-4 shadow-xl">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="bg-muted p-4 rounded-lg text-left mb-6 overflow-auto">
              <p className="text-sm font-mono text-destructive">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            {reset && (
              <Button onClick={reset} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button variant="outline" asChild className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
