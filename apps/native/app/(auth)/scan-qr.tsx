import { api } from "@event-schedulr/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

export default function ScanQRScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [permission, requestPermission] = useCameraPermissions();

	const [scannedCode, setScannedCode] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [flashOn, setFlashOn] = useState(false);

	const scanLineY = useSharedValue(0);

	const validation = useQuery(
		api.accessCodes.validate,
		scannedCode ? { code: scannedCode } : "skip",
	);

	const scanLineStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: scanLineY.value }],
	}));

	useEffect(() => {
		scanLineY.value = withRepeat(
			withSequence(
				withTiming(200, { duration: 2000 }),
				withTiming(0, { duration: 2000 }),
			),
			-1,
			false,
		);
	}, [scanLineY]);

	useEffect(() => {
		if (validation && scannedCode) {
			if (validation.valid && validation.event) {
				if (Platform.OS === "ios") {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				}
				router.push({
					pathname: "/(auth)/profile-setup",
					params: {
						code: scannedCode,
						eventId: validation.event._id,
						eventName: validation.event.name,
						accessMethod: "qr_code",
						messageToParticipants: validation.event.messageToParticipants || "",
					},
				});
			} else if (!validation.valid) {
				setError(validation.error || "Invalid QR code");
				setIsProcessing(false);
				setScannedCode(null);
				if (Platform.OS === "ios") {
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
				}
			}
		}
	}, [validation, scannedCode, router]);

	const handleBack = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.back();
	};

	const handleBarCodeScanned = useCallback(
		({ data }: { data: string }) => {
			if (isProcessing || scannedCode) return;

			console.log("Raw QR data:", data);

			if (Platform.OS === "ios") {
				Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			}

			setIsProcessing(true);
			setError(null);

			const urlMatch = data.match(/[?&]code=([A-Z0-9]+)/i);
			const code = urlMatch ? urlMatch[1] : data;

			console.log("Extracted code:", code.toUpperCase());

			setScannedCode(code.toUpperCase());
		},
		[isProcessing, scannedCode],
	);

	const toggleFlash = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		setFlashOn(!flashOn);
	};

	const handleManualEntry = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.replace("/(auth)/enter-code");
	};

	if (!permission) {
		return (
			<View className="flex-1 items-center justify-center bg-bg-main">
				<View className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</View>
		);
	}

	if (!permission.granted) {
		return (
			<View
				className="flex-1 bg-bg-main px-6"
				style={{
					paddingTop: insets.top + 20,
					paddingBottom: insets.bottom + 20,
				}}
			>
				<Animated.View entering={FadeIn.duration(300)}>
					<Pressable
						onPress={handleBack}
						className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-bg-card active:opacity-70"
					>
						<Ionicons name="arrow-back" size={20} color={colors.text.primary} />
					</Pressable>
				</Animated.View>

				<View className="flex-1 items-center justify-center">
					<View className="mb-6 h-20 w-20 items-center justify-center rounded-2xl bg-bg-card">
						<Ionicons
							name="camera-outline"
							size={40}
							color={colors.text.muted}
						/>
					</View>
					<Text className="mb-2 text-center font-semibold text-text-primary text-xl">
						Camera Access Required
					</Text>
					<Text className="mb-8 text-center text-base text-text-muted">
						We need camera access to scan{"\n"}the event QR code
					</Text>
					<Pressable
						onPress={requestPermission}
						className="h-12 items-center justify-center rounded-xl bg-primary px-8 active:opacity-90"
					>
						<Text className="font-semibold text-base text-text-inverse">
							Grant Permission
						</Text>
					</Pressable>
					<Pressable onPress={handleManualEntry} className="mt-4 p-2">
						<Text className="text-primary text-sm">
							Enter code manually instead
						</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-black">
			<CameraView
				className="flex-1"
				facing="back"
				enableTorch={flashOn}
				barcodeScannerSettings={{
					barcodeTypes: ["qr"],
				}}
				onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
			/>

			<View
				className="absolute inset-0"
				style={{
					paddingTop: insets.top + 20,
					paddingBottom: insets.bottom + 20,
				}}
			>
				<Animated.View
					entering={FadeIn.duration(300)}
					className="flex-row items-center justify-between px-6"
				>
					<Pressable
						onPress={handleBack}
						className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-70"
					>
						<Ionicons name="arrow-back" size={20} color="#ffffff" />
					</Pressable>
					<Pressable
						onPress={toggleFlash}
						className={`h-10 w-10 items-center justify-center rounded-full active:opacity-70 ${
							flashOn ? "bg-primary" : "bg-black/50"
						}`}
					>
						<Ionicons
							name={flashOn ? "flash" : "flash-outline"}
							size={20}
							color="#ffffff"
						/>
					</Pressable>
				</Animated.View>

				<View className="flex-1 items-center justify-center">
					<View className="relative h-64 w-64">
						<View className="absolute top-0 left-0 h-12 w-12 rounded-tl-2xl border-primary border-t-4 border-l-4" />
						<View className="absolute top-0 right-0 h-12 w-12 rounded-tr-2xl border-primary border-t-4 border-r-4" />
						<View className="absolute bottom-0 left-0 h-12 w-12 rounded-bl-2xl border-primary border-b-4 border-l-4" />
						<View className="absolute right-0 bottom-0 h-12 w-12 rounded-br-2xl border-primary border-r-4 border-b-4" />

						<Animated.View
							style={scanLineStyle}
							className="absolute right-4 left-4 h-0.5 bg-primary"
						/>
					</View>
				</View>

				<Animated.View
					entering={FadeInDown.delay(200).duration(500)}
					className="items-center px-6"
				>
					{isProcessing ? (
						<View className="mb-4 flex-row items-center gap-2 rounded-xl bg-black/50 px-4 py-3">
							<View className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							<Text className="text-sm text-white">Validating...</Text>
						</View>
					) : error ? (
						<View className="mb-4 items-center rounded-xl bg-error/80 px-4 py-3">
							<View className="flex-row items-center gap-2">
								<Ionicons name="alert-circle" size={18} color="#ffffff" />
								<Text className="text-sm text-white">{error}</Text>
							</View>
							{scannedCode && (
								<Text className="mt-1 text-white/70 text-xs">
									Scanned: {scannedCode}
								</Text>
							)}
							<Pressable
								onPress={() => {
									setError(null);
									setScannedCode(null);
									setIsProcessing(false);
								}}
								className="mt-2 rounded-lg bg-white/20 px-4 py-2"
							>
								<Text className="text-sm text-white">Try Again</Text>
							</Pressable>
						</View>
					) : (
						<Text className="mb-4 text-center text-base text-white">
							Point your camera at the QR code
						</Text>
					)}

					<Pressable onPress={handleManualEntry} className="p-2">
						<Text className="text-primary text-sm">Enter code manually</Text>
					</Pressable>
				</Animated.View>
			</View>
		</View>
	);
}
