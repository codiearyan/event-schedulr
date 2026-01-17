import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import { google } from "better-auth";
import type { AuthConfig } from "convex/server";

export default {
	providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
