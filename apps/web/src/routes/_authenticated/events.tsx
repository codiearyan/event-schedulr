import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Edit, Eye, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { EventDetailsModal } from "@/components/event-details-modal";

export const Route = createFileRoute("/_authenticated/events")({
  component: EventsRoute,
});

function EventsRoute() {
  const navigate = useNavigate();
  const events = useQuery(api.events.getAll);
  const deleteEvent = useMutation(api.events.remove);
  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(
    null
  );
  const [deletingEventId, setDeletingEventId] = useState<Id<"events"> | null>(
    null
  );

  const handleDelete = async (eventId: Id<"events">, eventName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${eventName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingEventId(eventId);
    try {
      await deleteEvent({ id: eventId });
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete event"
      );
    } finally {
      setDeletingEventId(null);
    }
  };

  if (events === undefined) {
    return (
      <div className="bg-bg-main min-h-screen w-full text-white">
        <div className="mx-auto container w-full space-y-6 py-10">
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Loading events...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-main min-h-screen w-full text-white">
      <div className="mx-auto container w-full space-y-6 py-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Sparkles className="h-6 w-6" />
              Events
            </h1>
            <p className="text-muted-foreground">
              Manage and view all your events
            </p>
          </div>
          <Link to="/create-event" search={{ eventId: undefined }}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No events yet</h3>
              <p className="mb-6 text-muted-foreground">
                Get started by creating your first event
              </p>
              <Link to="/create-event" search={{ eventId: undefined }}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event._id} className="flex flex-col">
                <CardHeader>
                  {event.logo && (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={event.logo}
                        alt={event.name}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedEventId(event._id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate({
                        to: "/create-event",
                        search: { eventId: event._id },
                      })
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(event._id, event.name)}
                    disabled={deletingEventId === event._id}
                  >
                    <Trash2
                      className={`h-4 w-4 ${
                        deletingEventId === event._id ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedEventId && (
          <EventDetailsModal
            eventId={selectedEventId}
            onClose={() => setSelectedEventId(null)}
          />
        )}
      </div>
    </div>
  );
}
