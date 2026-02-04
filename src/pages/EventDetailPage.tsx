import { useParams, Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { ArrowLeft, Calendar, Clock, MapPin, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RegistrationForm } from '@/components/events/RegistrationForm';
import { useEvent } from '@/hooks/useEvents';
import { useRegistrationCount } from '@/hooks/useRegistrations';

type EventTypeKey = 'symposium' | 'workshop' | 'contest' | 'seminar' | 'hackathon' | 'other';

const eventTypeConfig: Record<EventTypeKey, { label: string; className: string }> = {
  symposium: { label: 'Symposium', className: 'bg-event-symposium text-white' },
  workshop: { label: 'Workshop', className: 'bg-event-workshop text-white' },
  contest: { label: 'Contest', className: 'bg-event-contest text-white' },
  seminar: { label: 'Seminar', className: 'bg-event-seminar text-white' },
  hackathon: { label: 'Hackathon', className: 'bg-event-hackathon text-white' },
  other: { label: 'Event', className: 'bg-event-other text-white' },
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id || '0', 10);
  const { data: event, isLoading } = useEvent(eventId);
  const { data: registrationCount } = useRegistrationCount(eventId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-6 h-12 w-3/4" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-warning" />
        <h1 className="mb-4 font-display text-3xl font-bold text-foreground">Event Not Found</h1>
        <p className="mb-6 text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const deadline = new Date(event.registration_deadline);
  const isEventPast = isPast(eventDate);
  const isDeadlinePast = isPast(deadline);
  const canRegister = event.registration_open && !isDeadlinePast && !isEventPast;
  const typeKey = (event.event_type in eventTypeConfig ? event.event_type : 'other') as EventTypeKey;
  const typeConfig = eventTypeConfig[typeKey];
  const spotsLeft = event.max_participants ? event.max_participants - (registrationCount || 0) : null;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link 
        to="/" 
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`event-badge ${typeConfig.className}`}>
            {typeConfig.label}
          </span>
          {canRegister && (
            <Badge className="bg-success text-success-foreground">Open for Registration</Badge>
          )}
          {isEventPast && (
            <Badge variant="secondary">Event Completed</Badge>
          )}
          {!isEventPast && !event.registration_open && (
            <Badge variant="destructive">Registration Closed</Badge>
          )}
          {!isEventPast && event.registration_open && isDeadlinePast && (
            <Badge variant="secondary" className="bg-warning/20 text-warning border-warning">Deadline Passed</Badge>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
          {event.title}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Details Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">Event Details</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">{format(eventDate, 'h:mm a')}</p>
                </div>
              </div>

              {event.venue && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium text-foreground">{event.venue}</p>
                  </div>
                </div>
              )}

              {event.max_participants && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-medium text-foreground">
                      {registrationCount || 0} / {event.max_participants} registered
                      {spotsLeft !== null && spotsLeft > 0 && (
                        <span className="ml-2 text-success">({spotsLeft} spots left)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Deadline */}
            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Registration Deadline:{' '}
                <span className={`font-semibold ${isDeadlinePast ? 'text-destructive' : 'text-foreground'}`}>
                  {format(deadline, 'MMMM d, yyyy h:mm a')}
                </span>
              </p>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display text-xl font-semibold text-foreground">About This Event</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Registration Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
            {canRegister ? (
              <>
                <div className="mb-6 flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Registration Open</span>
                </div>
                <RegistrationForm event={event} />
              </>
            ) : (
              <div className="text-center">
                <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-warning" />
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {isEventPast ? 'Event Completed' : 'Registration Unavailable'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isEventPast 
                    ? 'This event has already taken place.'
                    : isDeadlinePast 
                      ? 'The registration deadline has passed.'
                      : 'Registration is currently closed for this event.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
