import type { Id } from "@event-schedulr/backend/convex/_generated/dataModel";
import * as SecureStore from "expo-secure-store";
import type { PropsWithChildren } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

const PARTICIPANT_KEY = "participant_session";

type ParticipantSession = {
	participantId: string;
	eventId: string;
	name: string;
	email: string;
	avatarSeed: string;
};

type ParticipantContextType = {
	session: ParticipantSession | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	setSession: (session: ParticipantSession) => Promise<void>;
	clearSession: () => Promise<void>;
};

const ParticipantContext = createContext<ParticipantContextType | undefined>(
	undefined,
);

export function ParticipantProvider({ children }: PropsWithChildren) {
	const [session, setSessionState] = useState<ParticipantSession | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadSession = async () => {
			try {
				const stored = await SecureStore.getItemAsync(PARTICIPANT_KEY);
				if (stored) {
					setSessionState(JSON.parse(stored));
				}
			} catch (error) {
				console.error("Failed to load participant session:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadSession();
	}, []);

	const setSession = useCallback(async (newSession: ParticipantSession) => {
		try {
			await SecureStore.setItemAsync(
				PARTICIPANT_KEY,
				JSON.stringify(newSession),
			);
			setSessionState(newSession);
		} catch (error) {
			console.error("Failed to save participant session:", error);
			throw error;
		}
	}, []);

	const clearSession = useCallback(async () => {
		try {
			await SecureStore.deleteItemAsync(PARTICIPANT_KEY);
			setSessionState(null);
		} catch (error) {
			console.error("Failed to clear participant session:", error);
			throw error;
		}
	}, []);

	const value = useMemo(
		() => ({
			session,
			isLoading,
			isAuthenticated: !!session,
			setSession,
			clearSession,
		}),
		[session, isLoading, setSession, clearSession],
	);

	return (
		<ParticipantContext.Provider value={value}>
			{children}
		</ParticipantContext.Provider>
	);
}

export function useParticipant() {
	const context = useContext(ParticipantContext);
	if (!context) {
		throw new Error("useParticipant must be used within ParticipantProvider");
	}
	return context;
}
