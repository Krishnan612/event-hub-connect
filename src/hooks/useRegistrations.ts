import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Registration, RegistrationFormData } from '@/types/database';

export function useRegistrations(eventId: number) {
  return useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async (): Promise<Registration[]> => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registrationData: RegistrationFormData & { event_id: number }) => {
      const { data, error } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select()
        .single();
      
      if (error) {
        console.error('Registration error:', error);
        // Handle specific error messages from triggers
        // We use ?. (optional chaining) to prevent crashes if message is missing
        if (error.message?.includes('Registration is closed')) {
          throw new Error('Registration is currently closed for this event');
        }
        if (error.message?.includes('deadline has passed')) {
          throw new Error('The registration deadline has passed');
        }
        if (error.message?.includes('maximum participants')) {
          throw new Error('This event has reached its maximum capacity');
        }
        if (error.code === '23505') {
          throw new Error('You have already registered for this event');
        }
        // Log the actual error for debugging
        if (error.message) {
          throw new Error(error.message);
        }
        throw new Error('Failed to register for this event. Please try again.');
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrations', variables.event_id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, eventId }: { id: number; eventId: number }) => {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ['registrations', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useRegistrationCount(eventId: number) {
  return useQuery({
    queryKey: ['registrations', eventId, 'count'],
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!eventId,
  });
}