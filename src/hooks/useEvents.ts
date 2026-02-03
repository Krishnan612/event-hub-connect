import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Event, EventFormData, EventWithRegistrationCount } from '@/types/database';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: async (): Promise<Event[]> => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', now)
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function usePastEvents() {
  return useQuery({
    queryKey: ['events', 'past'],
    queryFn: async (): Promise<Event[]> => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .lt('event_date', now)
        .order('event_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async (): Promise<Event | null> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    },
    enabled: !!id,
  });
}

export function useEventsWithRegistrationCount() {
  return useQuery({
    queryKey: ['events', 'withCount'],
    queryFn: async (): Promise<EventWithRegistrationCount[]> => {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      
      if (eventsError) throw eventsError;
      if (!events) return [];

      // Get registration counts for each event
      const eventsWithCounts = await Promise.all(
        events.map(async (event) => {
          const { count } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);
          
          return {
            ...event,
            registration_count: count || 0,
          };
        })
      );

      return eventsWithCounts;
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: EventFormData) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...eventData }: EventFormData & { id: number }) => {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useToggleRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, registration_open }: { id: number; registration_open: boolean }) => {
      const { data, error } = await supabase
        .from('events')
        .update({ registration_open })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
    },
  });
}
