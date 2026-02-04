import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEvent, useCreateEvent, useUpdateEvent } from '@/hooks/useEvents';
import type { EventType } from '@/types/database';

const eventSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  event_type: z.enum(['symposium', 'workshop', 'contest', 'seminar', 'hackathon', 'other']),
  event_date: z.string().min(1, 'Event date is required'),
  registration_deadline: z.string().min(1, 'Registration deadline is required'),
  venue: z.string().max(200).optional(),
  max_participants: z.coerce.number().int().positive().optional().or(z.literal('')),
  registration_open: z.boolean(),
  poster_url: z.string().url().optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

interface AdminEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | null;
}

export function AdminEventDialog({ open, onOpenChange, eventId }: AdminEventDialogProps) {
  const { toast } = useToast();
  const { data: existingEvent, isLoading: isLoadingEvent } = useEvent(eventId || 0);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const isEditing = !!eventId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      registration_open: true,
    },
  });

  useEffect(() => {
    if (existingEvent && isEditing) {
      reset({
        title: existingEvent.title,
        description: existingEvent.description || '',
        event_type: existingEvent.event_type as EventType,
        event_date: existingEvent.event_date.slice(0, 16),
        registration_deadline: existingEvent.registration_deadline.slice(0, 16),
        venue: existingEvent.venue || '',
        max_participants: existingEvent.max_participants || '',
        registration_open: existingEvent.registration_open,
        poster_url: existingEvent.poster_url || '',
      });
    } else if (!isEditing) {
      reset({
        title: '',
        description: '',
        event_type: 'workshop',
        event_date: '',
        registration_deadline: '',
        venue: '',
        max_participants: '',
        registration_open: true,
        poster_url: '',
      });
    }
  }, [existingEvent, isEditing, reset]);

  const onSubmit = async (data: EventFormData) => {
    try {
      const eventData = {
        title: data.title,
        description: data.description || null,
        event_type: data.event_type,
        event_date: new Date(data.event_date).toISOString(),
        registration_deadline: new Date(data.registration_deadline).toISOString(),
        venue: data.venue || null,
        max_participants: data.max_participants ? Number(data.max_participants) : null,
        registration_open: data.registration_open,
        poster_url: data.poster_url || null,
      };

      if (isEditing && eventId) {
        await updateEvent.mutateAsync({ id: eventId, ...eventData });
        toast({
          title: 'Event Updated',
          description: 'The event has been updated successfully.',
        });
      } else {
        await createEvent.mutateAsync(eventData);
        toast({
          title: 'Event Created',
          description: 'The new event has been created successfully.',
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        {isLoadingEvent && isEditing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., TechVista 2026 - Annual Technical Symposium"
                {...register('title')}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type *</Label>
              <Select
                value={watch('event_type')}
                onValueChange={(value) => setValue('event_type', value as EventType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="symposium">Symposium</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="contest">Contest</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your event..."
                rows={4}
                {...register('description')}
              />
            </div>

            {/* Date and Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date & Time *</Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  {...register('event_date')}
                  aria-invalid={!!errors.event_date}
                />
                {errors.event_date && (
                  <p className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.event_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_deadline">Registration Deadline *</Label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  {...register('registration_deadline')}
                  aria-invalid={!!errors.registration_deadline}
                />
                {errors.registration_deadline && (
                  <p className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.registration_deadline.message}
                  </p>
                )}
              </div>
            </div>

            {/* Venue and Capacity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="e.g., CSE Seminar Hall"
                  {...register('venue')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  {...register('max_participants')}
                />
              </div>
            </div>

            {/* Poster URL */}
            <div className="space-y-2">
              <Label htmlFor="poster_url">Poster URL (optional)</Label>
              <Input
                id="poster_url"
                type="url"
                placeholder="https://example.com/poster.jpg"
                {...register('poster_url')}
              />
            </div>

            {/* Registration Open */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label htmlFor="registration_open" className="text-base">
                  Registration Open
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to register for this event
                </p>
              </div>
              <Switch
                id="registration_open"
                checked={watch('registration_open')}
                onCheckedChange={(checked) => setValue('registration_open', checked)}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Event' : 'Create Event'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
