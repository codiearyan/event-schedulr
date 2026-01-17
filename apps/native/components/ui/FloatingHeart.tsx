import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FloatingHeartProps {
	id: string;
	onComplete: () => void;
}

export function FloatingHeart({ id, onComplete }: FloatingHeartProps) {
	const translateY = useSharedValue(0);
	const translateX = useSharedValue(0);
	const scale = useSharedValue(0);
	const opacity = useSharedValue(1);

	const { startX, drift, size } = useMemo(
		() => ({
			startX: 10 + Math.random() * 80,
			drift: (Math.random() - 0.5) * 60,
			size: 24 + Math.random() * 16,
		}),
		[],
	);

	useEffect(() => {
		const animationDuration = 2500;
		const floatDistance = -SCREEN_HEIGHT * 0.5;

		scale.value = withSequence(
			withTiming(1.2, { duration: 200, easing: Easing.out(Easing.back(2)) }),
			withTiming(1, { duration: 200 }),
			withDelay(
				1800,
				withTiming(0.8, { duration: 300, easing: Easing.in(Easing.ease) }),
			),
		);

		translateY.value = withTiming(floatDistance, {
			duration: animationDuration,
			easing: Easing.out(Easing.cubic),
		});

		translateX.value = withTiming(drift, {
			duration: animationDuration,
			easing: Easing.inOut(Easing.sin),
		});

		opacity.value = withDelay(
			2000,
			withTiming(0, {
				duration: 500,
				easing: Easing.out(Easing.ease),
			}),
		);

		const timeout = setTimeout(() => {
			runOnJS(onComplete)();
		}, animationDuration + 100);

		return () => clearTimeout(timeout);
	}, [drift, onComplete, opacity, scale, translateX, translateY]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: translateY.value },
			{ translateX: translateX.value },
			{ scale: scale.value },
		],
		opacity: opacity.value,
	}));

	return (
		<Animated.View
			style={[
				styles.container,
				{ left: `${startX}%` as unknown as number },
				animatedStyle,
			]}
		>
			<Ionicons name="heart" size={size} color="#ef4444" />
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		bottom: 100,
	},
});
