import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Plus, Calendar, Users, Download, Trash2, Edit, 
  ToggleLeft, ToggleRight, LogOut, GraduationCap,
  LayoutDashboard, Settings, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEventsWithRegistrationCount, useDeleteEvent, useToggleRegistration } from '@/hooks/useEvents';
import { AdminEventDialog } from '@/components/admin/AdminEventDialog';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboardPage() {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const { data: events, isLoading } = useEventsWithRegistrationCount();
  const deleteEvent = useDeleteEvent();
  const toggleRegistration = useToggleRegistration();

  const handleToggleRegistration = async (eventId: number, currentState: boolean) => {
    try {
      await toggleRegistration.mutateAsync({ id: eventId, registration_open: !currentState });
      toast({
        title: `Registration ${!currentState ? 'Opened' : 'Closed'}`,
        description: `Event registration has been ${!currentState ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update registration status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await deleteEvent.mutateAsync(eventId);
      toast({
        title: 'Event Deleted',
        description: 'The event has been permanently deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event.',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = async (eventId: number, eventTitle: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-registrations?event_id=${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `csedepartment_event_${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: `Registrations for "${eventTitle}" exported.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Unable to export registrations.',
        variant: 'destructive',
      });
    }
  };

  const handleEditEvent = (eventId: number) => {
    setEditingEventId(eventId);
    setIsEventDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEventDialogOpen(false);
    setEditingEventId(null);
  };

  const upcomingCount = events?.filter(e => new Date(e.event_date) >= new Date()).length || 0;
  const totalRegistrations = events?.reduce((sum, e) => sum + (e.registration_count || 0), 0) || 0;

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display font-semibold text-sidebar-foreground">Admin Panel</span>
        </div>
        <nav className="p-4">
          <div className="space-y-1">
            <Link to="/admin" className="admin-nav active w-full justify-start text-sidebar-foreground">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/" className="admin-nav w-full justify-start text-sidebar-foreground">
              <Eye className="h-4 w-4" />
              View Site
            </Link>
          </div>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-4 rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-sidebar-accent-foreground">Logged in as</p>
            <p className="truncate text-sm font-medium text-sidebar-foreground">{profile?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <h1 className="font-display text-xl font-semibold text-foreground">Event Management</h1>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsEventDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
            <Button variant="ghost" className="lg:hidden" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="p-6">
          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="stat-card">
              <div className="flex items-center justify-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="text-3xl font-bold text-foreground">{events?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-center gap-3">
                <Calendar className="h-8 w-8 text-accent" />
                <div className="text-left">
                  <p className="text-3xl font-bold text-foreground">{upcomingCount}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-center gap-3">
                <Users className="h-8 w-8 text-success" />
                <div className="text-left">
                  <p className="text-3xl font-bold text-foreground">{totalRegistrations}</p>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Events Table */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-display text-lg font-semibold text-foreground">All Events</h2>
            </div>
            
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : events?.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No events yet. Create your first event!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Registrations</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-foreground truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{event.venue}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {event.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{format(new Date(event.event_date), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(event.event_date), 'h:mm a')}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{event.registration_count || 0}</span>
                        {event.max_participants && (
                          <span className="text-muted-foreground"> / {event.max_participants}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={event.registration_open}
                            onCheckedChange={() => handleToggleRegistration(event.id, event.registration_open)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {event.registration_open ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExportCSV(event.id, event.title)}
                            title="Export CSV"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEvent(event.id)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Delete">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{event.title}"? 
                                  This will also delete all associated registrations. 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>

      {/* Event Dialog */}
      <AdminEventDialog 
        open={isEventDialogOpen} 
        onOpenChange={handleCloseDialog}
        eventId={editingEventId}
      />
    </div>
  );
}
