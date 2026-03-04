import { useState } from "react";
import { useEvents, useEventCategories } from "@/hooks/use-events";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: events, isLoading } = useEvents();
  const { data: categories } = useEventCategories();

  const now = new Date();
  
  const filteredEvents = events?.filter(event => {
    if (!selectedCategory) return true;
    return event.category === selectedCategory;
  }).sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const isPastA = dateA < now;
    const isPastB = dateB < now;
    
    if (isPastA && !isPastB) return 1;
    if (!isPastA && isPastB) return -1;
    return dateA.getTime() - dateB.getTime();
  }) || [];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-24">
      <div className="bg-secondary/30 py-16 md:py-24 border-b border-border">
        <div className="container px-6 md:px-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-3 md:mb-5">Events Calendar</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Get involved and connect with others at one of our upcoming gatherings.
          </p>
        </div>
      </div>

      <div className="container px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col lg:flex-row gap-10 md:gap-14">
          {/* Main List */}
          <div className="flex-1 space-y-6 md:space-y-8">
            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full"
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.name)}
                    className="rounded-full"
                    style={selectedCategory === cat.name ? { backgroundColor: cat.color } : {}}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            )}
            
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 md:mb-8">
              {selectedCategory ? `${selectedCategory} Events` : 'Upcoming Events'}
              <span className="text-muted-foreground font-normal text-lg ml-3">({filteredEvents.length})</span>
            </h2>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-56 md:h-72 w-full rounded-xl" />
              ))
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-6 md:space-y-8">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">No events found{selectedCategory ? ` in ${selectedCategory}` : ''}.</p>
                <p className="text-base mt-2">Check back soon for upcoming events!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[320px] md:lg:w-[380px] space-y-8 md:space-y-10">
            <Card>
              <CardHeader className="pb-4 md:pb-5">
                <CardTitle className="text-xl md:text-2xl">Calendar View</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={new Date()}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Category List in Sidebar */}
            {categories && categories.length > 0 && (
              <Card>
                <CardHeader className="pb-4 md:pb-5">
                  <CardTitle className="text-xl md:text-2xl">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-base transition-colors ${
                      selectedCategory === null ? 'bg-primary text-white' : 'hover:bg-secondary'
                    }`}
                  >
                    All Events ({events?.length || 0})
                  </button>
                  {categories.map((cat) => {
                    const count = events?.filter(e => e.category === cat.name).length || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-base transition-colors flex items-center justify-between ${
                          selectedCategory === cat.name ? 'text-white' : 'hover:bg-secondary'
                        }`}
                        style={selectedCategory === cat.name ? { backgroundColor: cat.color } : {}}
                      >
                        <span>{cat.name}</span>
                        <span className={`text-sm ${selectedCategory === cat.name ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            )}
            
            <div className="bg-primary/5 p-6 md:p-8 rounded-xl border border-primary/10">
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3">Host a Small Group?</h3>
              <p className="text-base text-muted-foreground mb-4 md:mb-5">
                We're always looking for new leaders to host community groups.
              </p>
              <button className="text-base font-semibold text-primary hover:underline">
                Learn More &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
