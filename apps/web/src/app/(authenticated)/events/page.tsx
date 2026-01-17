"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Edit, Eye, Plus, PlusIcon, Sparkles, Trash2 } from "lucide-react";
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
import { log } from "console";

export default function EventsPage() {
  const router = useRouter();
  const events = useQuery(api.events.getAll);
  console.log(events);

  const deleteEvent = useMutation(api.events.remove);
  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(
    null,
  );
  const [deletingEventId, setDeletingEventId] = useState<Id<"events"> | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("upcoming");

  function extractTime24(timestampMs: any) {
    const date = new Date(Number(timestampMs));
    return date.toLocaleTimeString("en-GB", { hour12: false });
  }
  function extractDate(timestampMs: number | string): string {
    const date = new Date(Number(timestampMs));

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  const handleDelete = async (eventId: Id<"events">, eventName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${eventName}"? This action cannot be undone.`,
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
        error instanceof Error ? error.message : "Failed to delete event",
      );
    } finally {
      setDeletingEventId(null);
    }
  };

  if (events === undefined) {
    return (
      <div className="w-full text-white">
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
    <div className="eve w-full flex flex-col h-max gap-12 text-white">
      <div className="w-full mt-25 flex justify-center">
        <div className="flex justify-around w-7xl">
          <div className="text-3xl font-semibold">Events</div>
          <div className="flex h-fit w-fit p-1 bg-bg-card rounded-xl">
            <button
              className={`px-2 cursor-pointer py-1 text-[14px] font-semibold rounded-xl
    ${
      activeTab === "upcoming"
        ? "text-white bg-[#41454E]"
        : "text-white/40 hover:text-white"
    }
  `}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>

            <button
              className={`cursor-pointer px-5 py-2 text-[14px] font-semibold rounded-xl
    ${
      activeTab === "past"
        ? "text-white bg-[#41454E]"
        : "text-white/40 hover:text-white"
    }
  `}
              onClick={() => setActiveTab("past")}
            >
              Past
            </button>
          </div>
        </div>
      </div>
      {events ? (
        <div className="w-full flex-col gap-5 flex items-center">
          {events.map((each, index) => (
            <Link
              href={`/events/${each._id}`}
              key={index}
              className="flex gap-2 justify-around items-center font-bold w-2xl bg-[#000020] rounded-xl h-50"
            >
              <div className="flex flex-col gap-2">
                <div className="">{extractDate(each.startsAt)}</div>
                <div className="">{extractTime24(each.startsAt)}</div>
                <div className=" text-xl">{each.name}</div>
                {each.status === "live" ? (
                  <div className="text-green-300 bg-[#3939dc] w-fit rounded-md  py-1 px-4">
                    {each.status}
                  </div>
                ) : (
                  <div className="text-[#3939dc] bg-green-300 w-fit rounded-md  py-1 px-4">
                    {each.status}
                  </div>
                )}
              </div>
              <div className="h-35 w-35">
                {each.logo && (
                  <img
                    src={each.logo}
                    className="h-35 w-35 rounded-lg"
                    alt=""
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div>
          <div className="w-full flex  justify-center">
            <img
              className="h-50 mt-10"
              src="https://cdn.discordapp.com/attachments/843057977023004692/1461829057414037817/image-Picsart-BackgroundRemover_1.png?ex=696bf9e6&is=696aa866&hm=2b3690aecb716fba50dbafb35e1d97ada901fb03f04c7b6f5d28f710a9304b9c&"
              alt="pics"
            />
          </div>

          <div className="w-full flex gap-3 flex-col items-center">
            <div className="text-2xl font-semibold">No Upcoming Events</div>
            <p className="text-[16px]">
              You have no upcoming events. Why not host one?
            </p>
            <Link
              href="/create-event"
              className="px-4 flex gap-1 py-2 items-center bg-[#3F3F3F] rounded-xl mt-5 hover:bg-[#AAABAB]"
            >
              <PlusIcon className="h-4" />
              Create Event
            </Link>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col items-center">
        <div className="border-b-[0.1px] w-2xl my-20 border-[#7c7ce6]">
        </div>
        <div className="w-full flex justify-center mb-20">
          <div className=".text-gradient text-[#7c7ce6]">
            Host Your Event With Us
          </div>
        </div>
      </div>
    </div>
  );
}
