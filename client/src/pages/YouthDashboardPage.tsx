import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LuUsers, LuCalendar, LuMusic, LuBookOpen, LuCamera, LuMessageSquare } from 'react-icons/lu';
import { Link } from "wouter";

export default function YouthDashboardPage() {
  const { user } = useAuth();

  const youthFeatures = [
    {
      title: "Youth Events",
      description: "Upcoming youth gatherings and activities",
      icon: Calendar,
      href: "/events?category=youth",
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Youth Group Chat",
      description: "Connect with other youth members",
      icon: MessageSquare,
      href: "/groups?type=youth",
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Music & Worship",
      description: "Youth worship team resources",
      icon: Music,
      href: "/music?category=youth",
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Bible Study",
      description: "Youth-focused devotionals and studies",
      icon: BookOpen,
      href: "/devotionals?category=youth",
      color: "text-orange-600 bg-orange-100",
    },
    {
      title: "Photo Gallery",
      description: "Memories from youth events",
      icon: Camera,
      href: "/gallery?category=youth",
      color: "text-pink-600 bg-pink-100",
    },
    {
      title: "Youth Directory",
      description: "Connect with other youth members",
      icon: Users,
      href: "/members?role=YOUTH",
      color: "text-teal-600 bg-teal-100",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Youth Ministry Dashboard - Community Hub</title>
      </Helmet>
      <div className="min-h-screen bg-background py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Youth Ministry Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.firstName}! Here's what's happening in Youth Ministry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {youthFeatures.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${feature.color}`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Youth Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Check out the events page for upcoming youth gatherings, Bible studies, and social activities.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/events?category=youth">View All Events</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Youth Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Youth Bible Study Materials</li>
                  <li>• Worship Team Resources</li>
                  <li>• Event Planning Guides</li>
                  <li>• Leadership Development</li>
                </ul>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/resources?category=youth">Browse Resources</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
