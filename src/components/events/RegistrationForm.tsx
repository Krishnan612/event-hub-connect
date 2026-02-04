import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateRegistration } from '@/hooks/useRegistrations';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/types/database';

const registrationSchema = z.object({
  student_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  student_email: z.string().trim().email('Invalid email address').max(255),
  student_roll_number: z.string().trim().min(1, 'Roll number is required').max(50),
  student_phone: z.string().trim().max(20).optional(),
  department: z.string().max(100).optional(),
  year_of_study: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  event: Event;
  onSuccess?: () => void;
}

export function RegistrationForm({ event, onSuccess }: RegistrationFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const createRegistration = useCreateRegistration();

const {
  register,
  handleSubmit,
  setValue,
  watch,
  formState: { errors, isSubmitting },
} = useForm<RegistrationFormData>({
  resolver: zodResolver(registrationSchema),
  defaultValues: {
    year_of_study: '',
  },
});

const year_of_study = watch('year_of_study');
  const onSubmit = async (data: RegistrationFormData) => {
    try {
      await createRegistration.mutateAsync({
        student_name: data.student_name,
        student_email: data.student_email,
        student_roll_number: data.student_roll_number,
        student_phone: data.student_phone,
        department: data.department,
        year_of_study: data.year_of_study,
        event_id: event.id,
      });
      setSubmitted(true);
      toast({
        title: 'Registration Successful!',
        description: `You have been registered for ${event.title}`,
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-success/30 bg-success/10 p-8 text-center">
        <CheckCircle2 className="mb-4 h-16 w-16 text-success" />
        <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
          Registration Confirmed!
        </h3>
        <p className="text-muted-foreground">
          You have successfully registered for <strong>{event.title}</strong>.
          A confirmation will be sent to your email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="student_name">Full Name *</Label>
        <Input
          id="student_name"
          placeholder="Enter your full name"
          {...register('student_name')}
          aria-invalid={!!errors.student_name}
        />
        {errors.student_name && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            {errors.student_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="student_email">Email Address *</Label>
        <Input
          id="student_email"
          type="email"
          placeholder="your.email@example.com"
          {...register('student_email')}
          aria-invalid={!!errors.student_email}
        />
        {errors.student_email && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            {errors.student_email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="student_roll_number">Roll Number *</Label>
        <Input
          id="student_roll_number"
          placeholder="e.g., 21CSE001"
          {...register('student_roll_number')}
          aria-invalid={!!errors.student_roll_number}
        />
        {errors.student_roll_number && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            {errors.student_roll_number.message}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="student_phone">Phone Number</Label>
          <Input
            id="student_phone"
            type="tel"
            placeholder="+91 98765 43210"
            {...register('student_phone')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            placeholder="e.g., Computer Science"
            {...register('department')}
          />
        </div>
      </div>

<div className="space-y-2">
  <Label htmlFor="year_of_study">Year of Study</Label>
  <Select value={year_of_study || ''} onValueChange={(value) => setValue('year_of_study', value)}>
    <SelectTrigger id="year_of_study">
      <SelectValue placeholder="Select your year" />
    </SelectTrigger>
          <SelectContent>
            <SelectItem value="1st Year">1st Year</SelectItem>
            <SelectItem value="2nd Year">2nd Year</SelectItem>
            <SelectItem value="3rd Year">3rd Year</SelectItem>
            <SelectItem value="4th Year">4th Year</SelectItem>
            <SelectItem value="PG 1st Year">PG 1st Year</SelectItem>
            <SelectItem value="PG 2nd Year">PG 2nd Year</SelectItem>
            <SelectItem value="PhD">PhD</SelectItem>
            <SelectItem value="Faculty">Faculty</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          'Complete Registration'
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By registering, you agree to receive event-related communications.
      </p>
    </form>
  );
}
