-- Create admin_role enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'student');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('symposium', 'workshop', 'contest', 'seminar', 'hackathon', 'other')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT,
  max_participants INTEGER,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  poster_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_roll_number TEXT NOT NULL,
  student_phone TEXT,
  department TEXT,
  year_of_study TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate registrations for same event
  UNIQUE(event_id, student_email)
);

-- Create indexes for performance
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_registration_deadline ON public.events(registration_deadline);
CREATE INDEX idx_events_registration_open ON public.events(registration_open);
CREATE INDEX idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX idx_registrations_student_email ON public.registrations(student_email);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Events policies (public read, admin write)
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Admins can create events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Registrations policies
CREATE POLICY "Anyone can register for events"
  ON public.registrations FOR INSERT
  WITH CHECK (true);

<<<<<<< HEAD
CREATE POLICY "Anyone can view registrations by email"
  ON public.registrations FOR SELECT
  USING (true);

=======
>>>>>>> cfee6e2a4e96418ef3f36fbdb1b36c7232dc7836
CREATE POLICY "Admins can view all registrations"
  ON public.registrations FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Students can view their own registrations"
  ON public.registrations FOR SELECT
  USING (student_email = (SELECT email FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can delete registrations"
  ON public.registrations FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Validation function to check registration is still allowed
CREATE OR REPLACE FUNCTION public.validate_registration()
RETURNS TRIGGER AS $$
DECLARE
  event_record public.events%ROWTYPE;
  current_count INTEGER;
BEGIN
  SELECT * INTO event_record FROM public.events WHERE id = NEW.event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;
  
  IF NOT event_record.registration_open THEN
    RAISE EXCEPTION 'Registration is closed for this event';
  END IF;
  
  IF event_record.registration_deadline < now() THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;
  
  IF event_record.max_participants IS NOT NULL THEN
    SELECT COUNT(*) INTO current_count 
    FROM public.registrations 
    WHERE event_id = NEW.event_id;
    
    IF current_count >= event_record.max_participants THEN
      RAISE EXCEPTION 'Event has reached maximum participants';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to validate registration before insert
CREATE TRIGGER validate_registration_before_insert
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_registration();

-- Insert sample seed data
-- Sample events (one upcoming, one past)
INSERT INTO public.events (title, description, event_type, event_date, registration_deadline, venue, max_participants, registration_open, poster_url) VALUES
  ('TechVista 2026 - Annual Technical Symposium', 'Join us for the flagship technical symposium featuring workshops, competitions, and guest lectures from industry experts. Experience cutting-edge technology demonstrations and networking opportunities.', 'symposium', '2026-03-15 09:00:00+05:30', '2026-03-10 23:59:59+05:30', 'CSE Seminar Hall, Block A', 200, true, NULL),
  ('Introduction to Machine Learning Workshop', 'A hands-on workshop covering fundamental ML concepts, Python libraries, and practical implementation of classification algorithms. Bring your laptop with Python installed.', 'workshop', '2026-02-20 14:00:00+05:30', '2026-02-18 23:59:59+05:30', 'Computer Lab 3, Block B', 40, true, NULL),
  ('CodeSprint - 24-Hour Hackathon', 'Form teams of 3-4 and build innovative solutions to real-world problems. Exciting prizes, mentorship from industry experts, and food provided throughout!', 'hackathon', '2026-04-05 08:00:00+05:30', '2026-04-01 23:59:59+05:30', 'Innovation Hub, Main Building', 100, true, NULL),
  ('Database Systems Seminar - Past Event', 'An introductory seminar on relational database concepts and SQL fundamentals. This event has already concluded.', 'seminar', '2025-12-01 10:00:00+05:30', '2025-11-28 23:59:59+05:30', 'Lecture Hall 101', 150, false, NULL);