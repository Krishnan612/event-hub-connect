import { format, isPast, differenceInDays } from 'date-fns';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Event } from '@/types/database';

interface EventCardProps {
  event: Event;
  showRegistrationButton?: boolean;
}

type EventTypeKey = 'symposium' | 'workshop' | 'contest' | 'seminar' | 'hackathon' | 'other';

const eventTypeConfig: Record<EventTypeKey, { label: string; className: string }> = {
  symposium: { label: 'Symposium', className: 'bg-event-symposium text-white' },
  workshop: { label: 'Workshop', className: 'bg-event-workshop text-white' },
  contest: { label: 'Contest', className: 'bg-event-contest text-white' },
  seminar: { label: 'Seminar', className: 'bg-event-seminar text-white' },
  hackathon: { label: 'Hackathon', className: 'bg-event-hackathon text-white' },
  other: { label: 'Event', className: 'bg-event-other text-white' },
};

export function EventCard({ event, showRegistrationButton = true }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const deadline = new Date(event.registration_deadline);
  const isEventPast = isPast(eventDate);
  const isDeadlinePast = isPast(deadline);
  const daysUntilDeadline = differenceInDays(deadline, new Date());
  
  const canRegister = event.registration_open && !isDeadlinePast && !isEventPast;
  const typeKey = (event.event_type in eventTypeConfig ? event.event_type : 'other') as EventTypeKey;
  const typeConfig = eventTypeConfig[typeKey];

  const getStatusBadge = () => {
    if (isEventPast) {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Completed</Badge>;
    }
    if (!event.registration_open) {
      return <Badge variant="destructive">Registration Closed</Badge>;
    }
    if (isDeadlinePast) {
      return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning">Deadline Passed</Badge>;
    }
    if (daysUntilDeadline <= 3) {
      return <Badge className="bg-warning text-warning-foreground animate-pulse-soft">Closing Soon</Badge>;
    }
    return <Badge className="bg-success text-success-foreground">Open for Registration</Badge>;
  };

  return (
    <article className="event-card group">
      {/* Event Type Badge */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`event-badge ${typeConfig.className}`}>
          {typeConfig.label}
        </span>
        {getStatusBadge()}
      </div>

      {/* Title */}
      <h3 className="mb-3 font-display text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {event.title}
      </h3>

      {/* Description */}
      {event.description && (
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Event Details */}
      <div className="mb-5 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>{format(eventDate, 'h:mm a')}</span>
        </div>
        {event.venue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.venue}</span>
          </div>
        )}
        {event.max_participants && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>{event.max_participants} spots available</span>
          </div>
        )}
      </div>

      {/* Deadline Info */}
      {!isEventPast && (
        <div className="mb-5 rounded-lg bg-muted/50 px-4 py-2">
          <p className="text-xs text-muted-foreground">
            Registration Deadline:{' '}
            <span className={`font-medium ${isDeadlinePast ? 'text-destructive' : daysUntilDeadline <= 3 ? 'text-warning' : 'text-foreground'}`}>
              {format(deadline, 'MMM d, yyyy h:mm a')}
            </span>
          </p>
        </div>
      )}

      {/* Action Button */}
      {showRegistrationButton && (
        <Link to={`/events/${event.id}`}>
          <Button 
            className="w-full group/btn"
            variant={canRegister ? 'default' : 'secondary'}
          >
            {canRegister ? 'Register Now' : isEventPast ? 'View Details' : 'View Details'}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      )}
    </article>
  );
}
