import { EventCard } from './EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Event } from '@/types/database';
import { Calendar } from 'lucide-react';

interface EventListProps {
  events: Event[];
  loading?: boolean;
  emptyMessage?: string;
}

export function EventList({ events, loading, emptyMessage = 'No events found' }: EventListProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="mb-3 h-7 w-full" />
            <Skeleton className="mb-4 h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="mt-5 h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16">
        <Calendar className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
        <p className="mt-1 text-sm text-muted-foreground/70">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => (
        <div 
          key={event.id} 
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}
