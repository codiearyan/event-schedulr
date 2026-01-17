import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { Button, Surface, TextField } from "heroui-native";
import type { ReactNode } from "react";
import { View } from "react-native";

import { ReactionButton } from "./ReactionButton";

interface BottomInputBarProps {
	value: string;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
	placeholder?: string;
	maxLength?: number;
	isDisabled?: boolean;
	isSubmitting?: boolean;
	showReactionButton?: boolean;
	activityId?: Id<"liveActivities">;
	participantId?: Id<"participants">;
	submitIcon?: keyof typeof Ionicons.glyphMap;
	submitLabel?: string;
	children?: ReactNode;
}

export function BottomInputBar({
	value,
	onChangeText,
	onSubmit,
	placeholder = "Type something...",
	maxLength,
	isDisabled = false,
	isSubmitting = false,
	showReactionButton = false,
	activityId,
	participantId,
	submitIcon = "send",
	submitLabel,
	children,
}: BottomInputBarProps) {
	const canSubmit = value.trim().length > 0 && !isDisabled && !isSubmitting;

	return (
		<Surface variant="secondary" className="border-bg-muted border-t p-4">
			<View className="flex-row items-end gap-2">
				<View className="flex-1">
					<TextField isDisabled={isDisabled}>
						<TextField.Input
							value={value}
							onChangeText={onChangeText}
							placeholder={placeholder}
							maxLength={maxLength}
							multiline
							returnKeyType="send"
							onSubmitEditing={onSubmit}
						/>
					</TextField>
				</View>
				{showReactionButton && activityId && participantId && (
					<ReactionButton
						activityId={activityId}
						participantId={participantId}
						size={44}
					/>
				)}
				<Button
					onPress={onSubmit}
					isDisabled={!canSubmit}
					className="h-11 w-11 p-0"
				>
					{submitLabel ? (
						submitLabel
					) : (
						<Ionicons name={submitIcon} size={18} color="#fff" />
					)}
				</Button>
			</View>
			{children}
		</Surface>
	);
}
