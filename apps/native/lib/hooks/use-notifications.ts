import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useParticipant } from "@/contexts/participant-context";

type ParticipantId = Id<"participants">;

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export function useNotifications() {
	const [expoPushToken, setExpoPushToken] = useState<string>();
	const [permissionStatus, setPermissionStatus] =
		useState<Notifications.PermissionStatus | null>(null);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const registerToken = useMutation(api.participants.registerPushToken);
	const participant = useParticipant();
	const data = participant.session ?? null;

	const notificationListener = useRef<Notifications.EventSubscription | null>(
		null,
	);
	const responseListener = useRef<Notifications.EventSubscription | null>(null);

	const openSettings = useCallback(async () => {
		setShowSettingsModal(false);
		await Linking.openSettings();
	}, []);

	const dismissSettingsModal = useCallback(() => {
		setShowSettingsModal(false);
	}, []);

	useEffect(() => {
		if (!data) return;

		Notifications.getPermissionsAsync().then(({ status }) => {
			setPermissionStatus(status);
			if (status === "denied") {
				setShowSettingsModal(true);
			} else if (status !== "granted") {
				Notifications.requestPermissionsAsync()
					.then(({ status: newStatus }) => {
						setPermissionStatus(newStatus);
						if (newStatus === "denied") {
							setShowSettingsModal(true);
						}
					})
					.catch(() => console.log("Permission request failed"));
			}
		});

		registerForPushNotificationsAsync()
			.then((token) => {
				if (token) {
					setExpoPushToken(token);
					if (data.participantId) {
						registerToken({
							participantId: data.participantId as ParticipantId,
							expoPushToken: token,
						});
					}
				}
			})
			.catch((error) => {
				console.error("Failed to register for push notifications:", error);
			});

		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				const notificationType = notification.request.content.data?.type;

				if (notificationType === "ANNOUNCEMENT") {
					console.log("New announcement received:", notification);
				}
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				const responseData = response.notification.request.content.data;

				if (responseData?.type === "ANNOUNCEMENT") {
					console.log("Announcement notification tapped:", responseData);
				}
			});

		return () => {
			notificationListener.current?.remove();
			responseListener.current?.remove();
		};
	}, [data?.participantId, registerToken, data]);

	const requestPermission = useCallback(async () => {
		const { status } = await Notifications.requestPermissionsAsync();
		setPermissionStatus(status);
		if (status === "granted") {
			const token = await registerForPushNotificationsAsync();
			if (token) {
				setExpoPushToken(token);
				if (data?.participantId) {
					registerToken({
						participantId: data.participantId as ParticipantId,
						expoPushToken: token,
					});
				}
			}
		} else if (status === "denied") {
			setShowSettingsModal(true);
		}
		return status;
	}, [data?.participantId, registerToken]);

	const checkAndRequestPermission = useCallback(async () => {
		const { status } = await Notifications.getPermissionsAsync();
		setPermissionStatus(status);
		if (status === "denied") {
			setShowSettingsModal(true);
			return status;
		}
		if (status !== "granted") {
			return requestPermission();
		}
		return status;
	}, [requestPermission]);

	if (!data) {
		return null;
	}

	return {
		expoPushToken,
		permissionStatus,
		isPermissionGranted: permissionStatus === "granted",
		isPermissionDenied: permissionStatus === "denied",
		showSettingsModal,
		openSettings,
		dismissSettingsModal,
		requestPermission,
		checkAndRequestPermission,
	};
}

async function registerForPushNotificationsAsync() {
	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("announcements", {
			name: "Announcements",
			importance: Notifications.AndroidImportance.HIGH,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#0066FF",
		});
	}

	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") {
			console.log("Failed to get push token!");
			return;
		}

		try {
			const projectId =
				Constants?.expoConfig?.extra?.eas?.projectId ||
				Constants?.easConfig?.projectId;
			if (!projectId) throw new Error("Project ID not found");

			const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
				.data;
			console.log("Expo Push Token:", token);
			return token;
		} catch (e: any) {
			console.error("Error getting push token:", e);
			return;
		}
	} else {
		console.log("Must use physical device for Push Notifications");
	}
}
