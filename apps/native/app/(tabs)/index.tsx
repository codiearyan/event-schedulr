import { Ionicons } from "@expo/vector-icons";
import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import * as Haptics from "expo-haptics";
import { useQuery } from "convex/react";
import { Button, Chip, ChipColor, Surface } from "heroui-native";
import { Image, Platform, Text, View } from "react-native";

import { Container } from "@/components/container";
import { useParticipant } from "@/contexts/participant-context";

function generateAvatarUrl(avatarSeed: string): string {
  const [seed, style = "adventurer"] = avatarSeed.split("-");
  return `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&size=200`;
}

export default function Home() {
  const { session, clearSession } = useParticipant();
  const healthCheck = useQuery(api.healthCheck.get);
  const event = useQuery(api.events.getCurrentEvent, session ? {} : "skip");

  const handleSignOut = async () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await clearSession();
  };

  return (
    <Container className="p-4">
      <View className="mb-4 py-6">
        <Text className="font-semibold text-3xl text-foreground tracking-tight">
          {event?.name || "EventSchedulr"}
        </Text>
        <Text className="mt-1 text-muted text-sm">
          {event?.description || "Event updates in realtime"}
        </Text>
      </View>

      {event && (
        <Surface variant="secondary" className="mb-4 rounded-lg p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Chip
              size="sm"
              color={
                (event.status === "live"
                  ? "success"
                  : event.status === "upcoming"
                  ? "primary"
                  : "default") as ChipColor
              }
            >
              {event.status.toUpperCase()}
            </Chip>
          </View>
          <Text className="text-sm text-muted">{event.description}</Text>
        </Surface>
      )}

      {session && (
        <Surface variant="secondary" className="mb-4 rounded-lg p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <Image
                source={{ uri: generateAvatarUrl(session.avatarSeed) }}
                className="h-12 w-12 rounded-xl bg-bg-card"
              />
              <View className="flex-1">
                <Text className="font-medium text-foreground">
                  {session.name}
                </Text>
                <Text className="mt-0.5 text-muted text-xs">
                  {session.email}
                </Text>
              </View>
            </View>
            <Button variant="danger" size="sm" onPress={handleSignOut}>
              Leave
            </Button>
          </View>
        </Surface>
      )}

      <Surface variant="secondary" className="rounded-lg p-4">
        <Text className="mb-2 font-medium text-foreground">API Status</Text>
        <View className="flex-row items-center gap-2">
          <View
            className={`h-2 w-2 rounded-full ${
              healthCheck === "OK" ? "bg-success" : "bg-danger"
            }`}
          />
          <Text className="text-muted text-xs">
            {healthCheck === undefined
              ? "Checking..."
              : healthCheck === "OK"
              ? "Connected to API"
              : "API Disconnected"}
          </Text>
        </View>
      </Surface>
    </Container>
  );
}
