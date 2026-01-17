"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import {
  Calendar,
  CalendarClock,
  FileText,
  Image,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const event = useQuery(
    api.events.getById,
    eventId ? { id: eventId as any } : "skip"
  );

  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const generateAccessCode = useMutation(api.accessCodes.generate);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    startsAt: "",
    endsAt: "",
    messageToParticipants: "",
    isCurrentEvent: false,
    generateAccessCode: false,
    maxUses: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!eventId;

  useEffect(() => {
    if (event) {
      const startDate = new Date(event.startsAt);
      const endDate = new Date(event.endsAt);
      const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        name: event.name,
        description: event.description,
        logo: event.logo || "",
        startsAt: formatDateTime(startDate),
        endsAt: formatDateTime(endDate),
        messageToParticipants: event.messageToParticipants || "",
        isCurrentEvent: event.isCurrentEvent,
        generateAccessCode: false,
        maxUses: "",
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const startsAt = new Date(formData.startsAt).getTime();
      const endsAt = new Date(formData.endsAt).getTime();

      if (startsAt >= endsAt) {
        toast.error("Start time must be before end time");
        setIsSubmitting(false);
        return;
      }

      if (isEditMode && eventId) {
        await updateEvent({
          id: eventId as any,
          name: formData.name,
          description: formData.description,
          logo: formData.logo || undefined,
          startsAt,
          endsAt,
          messageToParticipants: formData.messageToParticipants || undefined,
        });

        toast.success("Event updated successfully!");
      } else {
        const newEvent = await createEvent({
          name: formData.name,
          description: formData.description,
          logo: formData.logo || undefined,
          startsAt,
          endsAt,
          messageToParticipants: formData.messageToParticipants || undefined,
          isCurrentEvent: formData.isCurrentEvent,
        });

        if (!newEvent) {
          throw new Error("Failed to create event");
        }

        if (formData.generateAccessCode) {
          const maxUses = formData.maxUses
            ? Number.parseInt(formData.maxUses, 10)
            : undefined;

          const accessCode = await generateAccessCode({
            eventId: newEvent._id,
            maxUses,
          });

          toast.success(`Event created! Access code: ${accessCode?.code}`, {
            duration: 10000,
          });
        } else {
          toast.success("Event created successfully!");
        }
      }

      router.push("/events");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save event"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-main min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-2xl space-y-6 py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <CardTitle>
                {isEditMode ? "Edit Event" : "Create New Event"}
              </CardTitle>
            </div>
            <CardDescription>
              {isEditMode
                ? "Update your event details"
                : "Set up a new event and optionally generate an access code"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <FileText className="mr-2 inline h-4 w-4" />
                  Event Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="TechConf 2025"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  <FileText className="mr-2 inline h-4 w-4" />
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Annual technology conference featuring talks, workshops, and networking opportunities."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">
                  <Image className="mr-2 inline h-4 w-4" />
                  Logo URL (optional)
                </Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">
                    <Calendar className="mr-2 inline h-4 w-4" />
                    Start Date & Time *
                  </Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startsAt: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endsAt">
                    <CalendarClock className="mr-2 inline h-4 w-4" />
                    End Date & Time *
                  </Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    value={formData.endsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, endsAt: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="messageToParticipants">
                  <MessageSquare className="mr-2 inline h-4 w-4" />
                  Message to Participants (optional)
                </Label>
                <Textarea
                  id="messageToParticipants"
                  value={formData.messageToParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      messageToParticipants: e.target.value,
                    })
                  }
                  placeholder="Welcome to TechConf 2025! Check out the schedule and don't miss the keynote at 10 AM."
                  className="min-h-[80px]"
                />
              </div>

              {!isEditMode && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCurrentEvent"
                    checked={formData.isCurrentEvent}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isCurrentEvent: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="isCurrentEvent"
                    className="cursor-pointer font-normal"
                  >
                    Set as current event (will replace any existing current
                    event)
                  </Label>
                </div>
              )}

              {!isEditMode && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateAccessCode"
                      checked={formData.generateAccessCode}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          generateAccessCode: checked === true,
                        })
                      }
                    />
                    <Label
                      htmlFor="generateAccessCode"
                      className="cursor-pointer font-normal"
                    >
                      Generate access code for this event
                    </Label>
                  </div>

                  {formData.generateAccessCode && (
                    <div className="space-y-2 pl-6">
                      <Label htmlFor="maxUses">
                        Max Uses (optional - leave empty for unlimited)
                      </Label>
                      <Input
                        id="maxUses"
                        type="number"
                        min="1"
                        value={formData.maxUses}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxUses: e.target.value,
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting
                  ? isEditMode
                    ? "Updating Event..."
                    : "Creating Event..."
                  : isEditMode
                    ? "Update Event"
                    : "Create Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
