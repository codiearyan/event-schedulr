import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";
import { env } from "@event-schedulr/env/web-server";

export const {
	handler,
	getToken,
	fetchAuthQuery,
	fetchAuthMutation,
	fetchAuthAction,
} = convexBetterAuthReactStart({
	convexUrl: env.CONVEX_URL,
	convexSiteUrl: env.CONVEX_SITE_URL,
});
