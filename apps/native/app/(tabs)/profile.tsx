import { api } from "@event-schedulr/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import * as Application from "expo-application";
import * as Haptics from "expo-haptics";
import { Button, Surface } from "heroui-native";
import { Image, Platform, Pressable, Switch, Text, View } from "react-native";

import { Container } from "@/components/container";
import { colors } from "@/constants/colors";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useParticipant } from "@/contexts/participant-context";

function generateAvatarUrl(avatarSeed: string): string {
	const dashIndex = avatarSeed.indexOf("-");
	if (dashIndex === -1) {
		return `https://api.dicebear.com/9.x/adventurer/png?seed=${avatarSeed}&size=200`;
	}
	const seed = avatarSeed.substring(0, dashIndex);
	const style = avatarSeed.substring(dashIndex + 1);
	return `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&size=200`;
}

function SettingRow({
	icon,
	label,
	value,
	onPress,
	trailing,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value?: string;
	onPress?: () => void;
	trailing?: React.ReactNode;
}) {
	const Wrapper = onPress ? Pressable : View;
	return (
		<Wrapper
			onPress={onPress}
			className="flex-row items-center justify-between py-3"
		>
			<View className="flex-row items-center gap-3">
				<View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
					<Ionicons name={icon} size={18} color={colors.primary.default} />
				</View>
				<Text className="text-foreground">{label}</Text>
			</View>
			{trailing || (
				<View className="flex-row items-center gap-1">
					{value && <Text className="text-muted text-sm">{value}</Text>}
					{onPress && (
						<Ionicons
							name="chevron-forward"
							size={18}
							color={colors.text.muted}
						/>
					)}
				</View>
			)}
		</Wrapper>
	);
}

export default function Profile() {
	const { session, clearSession } = useParticipant();
	const { isDark, toggleTheme } = useAppTheme();
	const event = useQuery(api.events.getCurrentEvent, session ? {} : "skip");

	const handleSignOut = async () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
		await clearSession();
	};

	const handleThemeToggle = () => {
		if (Platform.OS === "ios") {
			Haptics.selectionAsync();
		}
		toggleTheme();
	};

	const appVersion = Application.nativeApplicationVersion || "1.0.0";
	const buildVersion = Application.nativeBuildVersion || "1";

	return (
		<Container className="px-4">
			{/* Profile Header */}
			<View className="items-center py-6">
				{session && (
					<>
						<Image
							source={{ uri: generateAvatarUrl(session.avatarSeed) }}
							className="h-24 w-24 rounded-3xl bg-bg-card"
						/>
						<Text className="mt-4 font-bold text-2xl text-foreground">
							{session.name}
						</Text>
						<Text className="mt-1 text-muted">{session.email}</Text>
					</>
				)}
			</View>

			{/* Event Info Card */}
			{event && (
				<Surface variant="secondary" className="mb-4 rounded-2xl p-4">
					<View className="mb-3 flex-row items-center gap-2">
						<Ionicons
							name="calendar"
							size={18}
							color={colors.primary.default}
						/>
						<Text className="font-semibold text-foreground">Event Details</Text>
					</View>
					<View className="gap-2">
						<View className="flex-row items-center justify-between">
							<Text className="text-muted text-sm">Event</Text>
							<Text className="font-medium text-foreground">{event.name}</Text>
						</View>
						<View className="flex-row items-center justify-between">
							<Text className="text-muted text-sm">Status</Text>
							<View className="flex-row items-center gap-1">
								<View
									className={`h-2 w-2 rounded-full ${
										event.status === "live"
											? "bg-success"
											: event.status === "upcoming"
												? "bg-primary"
												: "bg-muted"
									}`}
								/>
								<Text className="font-medium text-foreground">
									{event.status.charAt(0).toUpperCase() + event.status.slice(1)}
								</Text>
							</View>
						</View>
						{session && (
							<View className="flex-row items-center justify-between">
								<Text className="text-muted text-sm">Access Method</Text>
								<Text className="font-medium text-foreground">QR Code</Text>
							</View>
						)}
					</View>
				</Surface>
			)}

			{/* Preferences */}
			<Surface variant="secondary" className="mb-4 rounded-2xl px-4">
				<View className="border-border border-b py-3">
					<Text className="font-semibold text-foreground">Preferences</Text>
				</View>
				<SettingRow
					icon="moon"
					label="Dark Mode"
					trailing={
						<Switch
							value={isDark}
							onValueChange={handleThemeToggle}
							trackColor={{
								false: colors.border.default,
								true: colors.primary.default,
							}}
							thumbColor="#ffffff"
						/>
					}
				/>
			</Surface>

			{/* About */}
			<Surface variant="secondary" className="mb-6 rounded-2xl px-4">
				<View className="border-border border-b py-3">
					<Text className="font-semibold text-foreground">About</Text>
				</View>
				<SettingRow
					icon="information-circle"
					label="App Version"
					value={`${appVersion} (${buildVersion})`}
				/>
			</Surface>

			{/* Leave Event Button */}
			<Button variant="danger" onPress={handleSignOut} className="mb-4">
				<View className="flex-row items-center gap-2">
					<Ionicons name="exit-outline" size={18} color="#ffffff" />
					<Text className="font-semibold text-white">Leave Event</Text>
				</View>
			</Button>

			{/* Footer */}
			<View className="items-center pb-8">
				<Text className="text-muted text-xs">EventSchedulr</Text>
				<Text className="mt-1 text-muted text-xs">
					Made with ❤️ for event organizers
				</Text>
			</View>
		</Container>
	);
}
