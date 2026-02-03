// Database types for the CSE Department Events portal

export type EventType = 'symposium' | 'workshop' | 'contest' | 'seminar' | 'hackathon' | 'other';

export type UserRole = 'admin' | 'student';

export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_type: string; // Using string to match Supabase return type
  event_date: string;
  registration_deadline: string;
  venue: string | null;
  max_participants: number | null;
  registration_open: boolean;
  poster_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  event_id: number;
  student_name: string;
  student_email: string;
  student_roll_number: string;
  student_phone: string | null;
  department: string | null;
  year_of_study: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface EventWithRegistrationCount extends Event {
  registration_count?: number;
}

// Form types
export interface RegistrationFormData {
  student_name: string;
  student_email: string;
  student_roll_number: string;
  student_phone?: string;
  department?: string;
  year_of_study?: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  event_type: EventType;
  event_date: string;
  registration_deadline: string;
  venue?: string;
  max_participants?: number;
  registration_open: boolean;
  poster_url?: string;
}
