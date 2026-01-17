import { ConvexQueryClient } from "@convex-dev/react-query";

function getConvexUrl() {
  if (typeof window === "undefined") {
    return process.env.CONVEX_URL!;
  }
  return (import.meta as any).env.VITE_CONVEX_URL!;
}

let convexQueryClientSingleton: ConvexQueryClient | null = null;

export function getConvexQueryClient(): ConvexQueryClient {
  if (!convexQueryClientSingleton) {
    convexQueryClientSingleton = new ConvexQueryClient(getConvexUrl(), {
      expectAuth: true,
    });
  }
  return convexQueryClientSingleton;
}

export function getConvexClient() {
  return getConvexQueryClient().convexClient;
}
