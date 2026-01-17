import "@/global.css";
import { api } from "@event-schedulr/backend/convex/_generated/api";
import { env } from "@event-schedulr/env/native";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { LiveActivitiesProvider } from "@/contexts/live-activities-context";
import {
	ParticipantProvider,
	useParticipant,
} from "@/contexts/participant-context";

SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
	unsavedChangesWarning: false,
});

function StackLayout() {
	const { isLoading, isAuthenticated } = useParticipant();
	const router = useRouter();
	const [pendingCode, setPendingCode] = useState<string | null>(null);

	const validation = useQuery(
		api.accessCodes.validate,
		pendingCode ? { code: pendingCode } : "skip",
	);

	useEffect(() => {
		if (!isLoading) {
			SplashScreen.hideAsync();
		}
	}, [isLoading]);

	useEffect(() => {
		const handleDeepLink = (event: { url: string }) => {
			const parsed = Linking.parse(event.url);
			const code = parsed.queryParams?.code;

			if (code && typeof code === "string" && !isAuthenticated) {
				setPendingCode(code.toUpperCase());
			}
		};

		Linking.getInitialURL().then((url) => {
			if (url) handleDeepLink({ url });
		});

		const subscription = Linking.addEventListener("url", handleDeepLink);
		return () => subscription.remove();
	}, [isAuthenticated]);

	useEffect(() => {
		if (validation && pendingCode) {
			if (validation.valid && validation.event) {
				router.replace({
					pathname: "/(auth)/profile-setup",
					params: {
						code: pendingCode,
						eventId: validation.event._id,
						eventName: validation.event.name,
						accessMethod: "qr_code",
						messageToParticipants: validation.event.messageToParticipants || "",
					},
				});
			}
			setPendingCode(null);
		}
	}, [validation, pendingCode, router]);

	if (isLoading) {
		return null;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Protected guard={isAuthenticated}>
				<Stack.Screen name="(tabs)" />
			</Stack.Protected>

			<Stack.Protected guard={!isAuthenticated}>
				<Stack.Screen name="(auth)" />
			</Stack.Protected>

			<Stack.Screen name="+not-found" />
		</Stack>
	);
}

export default function Layout() {
	return (
		<ConvexProvider client={convex}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<ParticipantProvider>
						<AppThemeProvider>
							<HeroUINativeProvider>
								<LiveActivitiesProvider>
									<StackLayout />
								</LiveActivitiesProvider>
							</HeroUINativeProvider>
						</AppThemeProvider>
					</ParticipantProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</ConvexProvider>
	);
}
