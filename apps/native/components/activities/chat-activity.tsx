import { api } from "@event-schedulr/backend/convex/_generated/api";
import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Button, Surface, TextField, useThemeColor } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	View,
} from "react-native";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";

import { Container } from "@/components/container";
import { FloatingHeartsContainer } from "@/components/ui/FloatingHeartsContainer";
import { ReactionButton } from "@/components/ui/ReactionButton";

type ChatConfig = {
	type: "anonymous_chat";
	maxMessageLength: number;
	slowModeSeconds: number;
};

type Activity = {
	_id: Id<"liveActivities">;
	type: "anonymous_chat";
	title: string;
	status: string;
	config: ChatConfig;
};

type Props = {
	activity: Activity;
	participantId: Id<"participants">;
};

type ChatMessage = {
	_id: Id<"chatMessages">;
	anonymousName: string;
	message: string;
	sentAt: number;
	participantId: Id<"participants">;
};

export function ChatActivity({ activity, participantId }: Props) {
	const config = activity.config as ChatConfig;
	const [message, setMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [cooldownRemaining, setCooldownRemaining] = useState(0);

	const scrollViewRef = useRef<ScrollView>(null);
	const lastMessageCountRef = useRef(0);
	const seenMessagesRef = useRef<Set<string>>(new Set());

	const sendMessage = useMutation(api.chatMessages.send);
	const messages = useQuery(api.chatMessages.getRecentByActivity, {
		activityId: activity._id,
		limit: 100,
	}) as ChatMessage[] | undefined;
	const myAnonymousName = useQuery(
		api.chatMessages.getParticipantAnonymousName,
		{
			activityId: activity._id,
			participantId,
		},
	);

	const accentColor = useThemeColor("accent");
	const mutedColor = useThemeColor("muted");

	useEffect(() => {
		if (messages) {
			for (const msg of messages) {
				seenMessagesRef.current.add(msg._id);
			}
		}
	}, []);

	useEffect(() => {
		if (messages && messages.length > lastMessageCountRef.current) {
			lastMessageCountRef.current = messages.length;
			setTimeout(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages]);

	useEffect(() => {
		if (cooldownRemaining > 0) {
			const timer = setTimeout(() => {
				setCooldownRemaining((c) => c - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [cooldownRemaining]);

	const handleSend = async () => {
		if (!message.trim() || isSending || cooldownRemaining > 0) return;

		setIsSending(true);
		try {
			await sendMessage({
				activityId: activity._id,
				participantId,
				message: message.trim(),
			});

			if (Platform.OS === "ios") {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			}

			setMessage("");

			if (config.slowModeSeconds > 0) {
				setCooldownRemaining(config.slowModeSeconds);
			}
		} catch (error) {
			console.error("Failed to send message:", error);
			if (Platform.OS === "ios") {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
			}
		} finally {
			setIsSending(false);
		}
	};

	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const isNewMessage = (msgId: string) => {
		if (seenMessagesRef.current.has(msgId)) {
			return false;
		}
		seenMessagesRef.current.add(msgId);
		return true;
	};

	return (
		<Container>
			<FloatingHeartsContainer activityId={activity._id} />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
				keyboardVerticalOffset={100}
			>
				<View className="flex-1">
					{myAnonymousName && (
						<Surface variant="secondary" className="mx-4 mt-4 rounded-lg p-3">
							<View className="flex-row items-center gap-2">
								<Ionicons name="person" size={16} color={accentColor} />
								<Text className="text-foreground text-sm">
									You are{" "}
									<Text className="font-semibold">{myAnonymousName}</Text>
								</Text>
							</View>
						</Surface>
					)}

					<ScrollView
						ref={scrollViewRef}
						className="flex-1"
						contentContainerClassName="p-4"
						onContentSizeChange={() => {
							scrollViewRef.current?.scrollToEnd({ animated: false });
						}}
					>
						{(!messages || messages.length === 0) && (
							<View className="items-center justify-center py-10">
								<Ionicons
									name="chatbubbles-outline"
									size={40}
									color={mutedColor}
								/>
								<Text className="mt-3 font-medium text-foreground">
									No messages yet
								</Text>
								<Text className="mt-1 text-center text-muted text-xs">
									Be the first to say something!
								</Text>
							</View>
						)}

						{messages && messages.length > 0 && (
							<View className="gap-3">
								{messages.map((msg) => {
									const isOwnMessage = msg.participantId === participantId;
									const shouldAnimate = isNewMessage(msg._id);
									const enteringAnimation = shouldAnimate
										? isOwnMessage
											? FadeInRight.duration(300)
											: FadeInLeft.duration(300)
										: undefined;

									return (
										<Animated.View
											key={msg._id}
											entering={enteringAnimation}
											className={`${isOwnMessage ? "items-end" : "items-start"}`}
										>
											<Surface
												variant={isOwnMessage ? "default" : "secondary"}
												className={`max-w-[85%] rounded-2xl p-3 ${
													isOwnMessage
														? "rounded-br-sm bg-accent"
														: "rounded-bl-sm"
												}`}
											>
												<View className="mb-1 flex-row items-center gap-2">
													<Text
														className={`font-medium text-xs ${
															isOwnMessage ? "text-white/80" : "text-accent"
														}`}
													>
														{msg.anonymousName}
													</Text>
													<Text
														className={`text-xs ${
															isOwnMessage ? "text-white/60" : "text-muted"
														}`}
													>
														{formatTime(msg.sentAt)}
													</Text>
												</View>
												<Text
													className={
														isOwnMessage ? "text-white" : "text-foreground"
													}
												>
													{msg.message}
												</Text>
											</Surface>
										</Animated.View>
									);
								})}
							</View>
						)}
					</ScrollView>

					<Surface variant="secondary" className="border-bg-muted border-t p-4">
						<View className="flex-row items-end gap-2">
							<View className="flex-1">
								<TextField isDisabled={cooldownRemaining > 0}>
									<TextField.Input
										value={message}
										onChangeText={setMessage}
										placeholder={
											cooldownRemaining > 0
												? `Wait ${cooldownRemaining}s...`
												: "Type a message..."
										}
										maxLength={config.maxMessageLength}
										multiline
										returnKeyType="send"
										onSubmitEditing={handleSend}
									/>
								</TextField>
							</View>
							<ReactionButton
								activityId={activity._id}
								participantId={participantId}
								size={44}
							/>
							<Button
								onPress={handleSend}
								isDisabled={
									!message.trim() || isSending || cooldownRemaining > 0
								}
								className="h-11 w-11 p-0"
							>
								<Ionicons name="send" size={18} color="#fff" />
							</Button>
						</View>
						<View className="mt-2 flex-row items-center justify-between">
							<Text className="text-muted text-xs">
								{message.length}/{config.maxMessageLength}
							</Text>
							{config.slowModeSeconds > 0 && (
								<Text className="text-muted text-xs">
									Slow mode: {config.slowModeSeconds}s
								</Text>
							)}
						</View>
					</Surface>
				</View>
			</KeyboardAvoidingView>
		</Container>
	);
}
