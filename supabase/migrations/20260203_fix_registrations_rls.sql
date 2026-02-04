-- Fix RLS policies for registrations to allow anonymous inserts with select return
-- Drop old SELECT policies that were too restrictive
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Students can view their own registrations" ON public.registrations;

-- Create new more permissive SELECT policies
CREATE POLICY "Anyone can view registrations by email"
  ON public.registrations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage registrations"
  ON public.registrations FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Students can view their own registrations"
  ON public.registrations FOR SELECT
  USING (student_email = (SELECT email FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can delete registrations"
  ON public.registrations FOR DELETE
  USING (public.is_admin(auth.uid()));
