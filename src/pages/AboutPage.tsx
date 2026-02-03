import { GraduationCap, Target, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="mb-6 font-display text-4xl font-bold text-foreground md:text-5xl">
          About CSE Events Portal
        </h1>
        <p className="text-lg text-muted-foreground">
          The central hub for all Computer Science & Engineering department events. 
          Streamlining event management and student registrations for a better academic experience.
        </p>
      </div>

      {/* Mission */}
      <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 font-display font-semibold text-foreground">Education First</h3>
          <p className="text-sm text-muted-foreground">
            Supporting academic excellence through technical events and hands-on learning opportunities.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <Target className="h-8 w-8 text-accent" />
          </div>
          <h3 className="mb-2 font-display font-semibold text-foreground">Streamlined Process</h3>
          <p className="text-sm text-muted-foreground">
            Replacing scattered Google Forms with a unified registration system.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
            <Award className="h-8 w-8 text-success" />
          </div>
          <h3 className="mb-2 font-display font-semibold text-foreground">Digital Archive</h3>
          <p className="text-sm text-muted-foreground">
            Maintaining comprehensive records for NAAC/NBA accreditation and reporting.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10">
            <Users className="h-8 w-8 text-warning" />
          </div>
          <h3 className="mb-2 font-display font-semibold text-foreground">Community</h3>
          <p className="text-sm text-muted-foreground">
            Building a connected community of students, faculty, and industry experts.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl hero-gradient p-8 text-center text-white md:p-12">
        <h2 className="mb-4 font-display text-2xl font-bold md:text-3xl">
          Ready to Participate?
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-white/80">
          Browse our upcoming events and register for workshops, symposiums, hackathons, and more!
        </p>
        <Link to="/">
          <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Browse Events
          </Button>
        </Link>
      </div>
    </div>
  );
}
