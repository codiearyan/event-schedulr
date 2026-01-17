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
import { Suspense, useEffect, useState } from "react";
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
  return (
    <Suspense fallback={<CreateEventSkeleton />}>
      <CreateEventContent />
    </Suspense>
  );
}

function CreateEventSkeleton() {
  return (
    <div className="bg-bg-main min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-2xl space-y-6 py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <CardTitle>Loading...</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-white/10 rounded" />
              <div className="h-24 bg-white/10 rounded" />
              <div className="h-10 bg-white/10 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateEventContent() {
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
    isCurrentEvent: true,
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

        const maxUses = 999;

        await generateAccessCode({
          eventId: newEvent._id,
          maxUses,
        });
        toast.success("Event created successfully!");
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
    <div className="h-auto w-full text-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex mt-5 w-full gap-5 justify-center">
          <div className="left w-xs">
            <div className="bg-[rgba(90,90,90,0.12)] border border-[rgba(255,255,255,0.4)] flex flex-col gap-3 w-full h-80 rounded-xl">
              <img
                src="https://www.svgrepo.com/show/341256/user-avatar-filled.svg"
                alt=""
              />
              <input
                className="bg-[rgba(90,90,90,0.12)] w-full rounded-md h-10 p-2"
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="your logo link"
              />

              {!isEditMode && (
                <>
                  <div className="flex bg-[rgba(90,90,90,0.12)] w-full px-4 py-2 rounded-md items-center gap-2">
                    <Label
                      htmlFor="isCurrentEvent"
                      className="cursor-pointer text-xl"
                    >
                      Set Current
                    </Label>

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
                  </div>

                  {/* <div className="flex bg-[rgba(90,90,90,0.12)] w-full px-4 py-2 rounded-md items-center gap-2">
                    <Label
                      htmlFor="generateAccessCode"
                      className="cursor-pointer text-xl"
                    >
                      Generate Access Code
                    </Label>
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
                  </div>

                  {formData.generateAccessCode && (
                    <div className="flex bg-[rgba(90,90,90,0.5)] w-full px-4 py-2 rounded-md items-center gap-2">
                      <Label className="text-lg " htmlFor="maxUses">
                        Max Uses
                      </Label>
                      <input
                        className="flex"
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
                  )} */}
                </>
              )}
            </div>
          </div>
          <div className="right flex flex-col gap-5 w-lg">
            <div>
              <input
                id="name"
                className="w-full h-20 rounded-xl p-2 text-4xl focus:ring-0 font-bold tracking-wider"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Event Name"
                required
              />
            </div>
            <div>
              <div className="w-lg rounded-xl flex items-center bg-[rgba(90,90,90,0.12)] p-4 space-y-3">
                <div className="flex flex-col items-center w-full gap-4">
                  <div className="w-full max-w-md  rounded-xl p-5 shadow-lg font-sans relative">
                    <div className="absolute left-6.25 top-11 bottom-11 border-l border-dashed  z-0"></div>

                    <div className="relative flex items-center justify-between mb-6 z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        <label className="text-[#dbece0] font-medium">
                          Start
                        </label>
                      </div>

                      <div className="relative group">
                        <div className="flex items-center bg-[rgba(37,37,37,0.6)] rounded-lg overflow-hidden border border-transparent group-hover:border-white/10 transition-colors">
                          <div className="px-3 py-1.5 text-[#effdf3] text-sm border-r border-[rgb(96,97,96)] min-w-22.5 text-center">
                            {formData.startsAt
                              ? new Date(formData.startsAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                  }
                                )
                              : "DD MMM"}
                          </div>
                          <div className="px-3 py-1.5 text-[#effdf3] text-sm min-w-15 text-center">
                            {formData.startsAt
                              ? new Date(formData.startsAt).toLocaleTimeString(
                                  "en-GB",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  }
                                )
                              : "--:--"}
                          </div>
                        </div>
                        <input
                          type="datetime-local"
                          value={formData.startsAt}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startsAt: e.target.value,
                            })
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 
            [&::-webkit-calendar-picker-indicator]:absolute 
            [&::-webkit-calendar-picker-indicator]:w-full 
            [&::-webkit-calendar-picker-indicator]:h-full 
            [&::-webkit-calendar-picker-indicator]:opacity-0"
                          required
                        />
                      </div>
                    </div>

                    <div className="relative flex items-center justify-between z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full border border-[#8ca090] bg-[#252525]"></div>
                        <label className="text-[#dbece0] font-medium">
                          End
                        </label>
                      </div>

                      <div className="relative group">
                        <div className="flex items-center bg-[rgba(37,37,37,0.6)] rounded-lg overflow-hidden border border-transparent group-hover:border-white/10 transition-colors">
                          <div className="px-3 py-1.5 text-[#effdf3] text-sm border-r border-[#606160] min-w-22.5 text-center">
                            {formData.endsAt
                              ? new Date(formData.endsAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                  }
                                )
                              : "DD MMM"}
                          </div>
                          <div className="px-3 py-1.5 text-[#effdf3] text-sm min-w-15 text-center">
                            {formData.endsAt
                              ? new Date(formData.endsAt).toLocaleTimeString(
                                  "en-GB",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  }
                                )
                              : "--:--"}
                          </div>
                        </div>

                        <input
                          type="datetime-local"
                          value={formData.endsAt}
                          onChange={(e) =>
                            setFormData({ ...formData, endsAt: e.target.value })
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20
            [&::-webkit-calendar-picker-indicator]:absolute 
            [&::-webkit-calendar-picker-indicator]:w-full 
            [&::-webkit-calendar-picker-indicator]:h-full 
            [&::-webkit-calendar-picker-indicator]:opacity-0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="About Description"
                className="min-h-40 resize-none w-full p-5 bg-[rgba(90,90,90,0.12)] rounded-xl text-2xl placeholder:text-2xl font-(--font-input)"
                required
              />
            </div>
            <div>
              <Textarea
                id="messageToParticipants"
                value={formData.messageToParticipants}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    messageToParticipants: e.target.value,
                  })
                }
                placeholder="Message To Participants"
                className="min-h-40 resize-none w-full p-5 bg-[rgba(90,90,90,0.12)] rounded-xl text-2xl placeholder:text-2xl font-(--font-input)"
              />
            </div>
            <div className="w-full">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md py-5 text-lg cursor-pointer"
              >
                {isSubmitting
                  ? isEditMode
                    ? "Updating Event..."
                    : "Creating Event..."
                  : isEditMode
                  ? "Update Event"
                  : "Create Event"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}