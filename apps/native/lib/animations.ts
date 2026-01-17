import {
	Easing,
	type SharedValue,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";

export const springConfigs = {
	gentle: { damping: 15, stiffness: 150 },
	bouncy: { damping: 8, stiffness: 400 },
	stiff: { damping: 20, stiffness: 300 },
	responsive: { damping: 10, stiffness: 300 },
} as const;

export const timingConfigs = {
	fast: { duration: 150, easing: Easing.out(Easing.cubic) },
	medium: { duration: 300, easing: Easing.out(Easing.cubic) },
	slow: { duration: 500, easing: Easing.out(Easing.cubic) },
} as const;

export const animationPresets = {
	shake: (value: SharedValue<number>) => {
		"worklet";
		value.value = withSequence(
			withTiming(-10, { duration: 50 }),
			withTiming(10, { duration: 50 }),
			withTiming(-10, { duration: 50 }),
			withTiming(10, { duration: 50 }),
			withTiming(0, { duration: 50 }),
		);
	},

	pulse: (value: SharedValue<number>) => {
		"worklet";
		value.value = withSequence(
			withSpring(1.15, springConfigs.bouncy),
			withSpring(1, springConfigs.gentle),
		);
	},

	bounceIn: (value: SharedValue<number>) => {
		"worklet";
		value.value = withSequence(
			withSpring(1.2, springConfigs.bouncy),
			withSpring(0.95, springConfigs.responsive),
			withSpring(1, springConfigs.gentle),
		);
	},

	pressScale: (value: SharedValue<number>) => {
		"worklet";
		value.value = withSequence(
			withSpring(0.9, springConfigs.stiff),
			withSpring(1, springConfigs.responsive),
		);
	},

	tapFeedback: (value: SharedValue<number>) => {
		"worklet";
		value.value = withSequence(
			withSpring(0.9, springConfigs.stiff),
			withSpring(1.3, springConfigs.bouncy),
			withSpring(1, springConfigs.gentle),
		);
	},
};

export const createInfinitePulse = (value: SharedValue<number>) => {
	"worklet";
	value.value = withRepeat(
		withSequence(
			withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
			withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
		),
		-1,
		true,
	);
};

export const createStaggeredDelay = (index: number, delayMs = 80) =>
	index * delayMs;

export const fadeInConfig = (delay = 0) => ({
	entering: {
		initialValues: { opacity: 0, transform: [{ translateY: 10 }] },
		animations: {
			opacity: withTiming(1, { ...timingConfigs.medium }),
			transform: [{ translateY: withSpring(0, springConfigs.gentle) }],
		},
	},
});
