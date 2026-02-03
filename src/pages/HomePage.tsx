import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventList } from '@/components/events/EventList';
import { useUpcomingEvents, usePastEvents } from '@/hooks/useEvents';
import { Calendar, Clock, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { data: upcomingEvents, isLoading: upcomingLoading } = useUpcomingEvents();
  const { data: pastEvents, isLoading: pastLoading } = usePastEvents();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden py-20 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>Computer Science & Engineering Department</span>
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Department Events Portal
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
              Discover and register for symposiums, workshops, hackathons, and more. 
              Stay connected with the latest technical events in our department.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="stat-card flex items-center gap-3 bg-white/10 backdrop-blur-sm border-white/20">
                <Calendar className="h-8 w-8 text-white/80" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{upcomingEvents?.length || 0}</p>
                  <p className="text-sm text-white/70">Upcoming Events</p>
                </div>
              </div>
              <div className="stat-card flex items-center gap-3 bg-white/10 backdrop-blur-sm border-white/20">
                <Clock className="h-8 w-8 text-white/80" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{pastEvents?.length || 0}</p>
                  <p className="text-sm text-white/70">Past Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                  {activeTab === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {activeTab === 'upcoming' 
                    ? 'Register now to secure your spot' 
                    : 'Browse our event archive'}
                </p>
              </div>
              <TabsList className="grid w-full max-w-xs grid-cols-2">
                <TabsTrigger value="upcoming" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Past
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming" className="mt-0">
              <EventList 
                events={upcomingEvents || []} 
                loading={upcomingLoading}
                emptyMessage="No upcoming events at the moment"
              />
            </TabsContent>

            <TabsContent value="past" className="mt-0">
              <EventList 
                events={pastEvents || []} 
                loading={pastLoading}
                emptyMessage="No past events found"
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
