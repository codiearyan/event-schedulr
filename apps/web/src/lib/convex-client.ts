import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";

function getConvexUrl() {
  if (typeof window === "undefined") {
    return process.env.CONVEX_URL!;
  }
  return (import.meta as any).env.VITE_CONVEX_URL!;
}

const globalForConvex = globalThis as unknown as {
  convexQueryClient: ConvexQueryClient | undefined;
  queryClient: QueryClient | undefined;
  isConnected: boolean;
};

export function getConvexQueryClient(): ConvexQueryClient {
  if (!globalForConvex.convexQueryClient) {
    globalForConvex.convexQueryClient = new ConvexQueryClient(getConvexUrl(), {
      expectAuth: true,
    });
  }
  return globalForConvex.convexQueryClient;
}

export function getQueryClient(): QueryClient {
  if (!globalForConvex.queryClient) {
    const convexQueryClient = getConvexQueryClient();
    globalForConvex.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
        },
      },
    });
  }
  return globalForConvex.queryClient;
}

export function connectConvexToQueryClient() {
  if (!globalForConvex.isConnected) {
    try {
      const convexQueryClient = getConvexQueryClient();
      const queryClient = getQueryClient();
      convexQueryClient.connect(queryClient);
      globalForConvex.isConnected = true;
    } catch (e) {
      if (e instanceof Error && e.message.includes("already subscribed")) {
        globalForConvex.isConnected = true;
      } else {
        throw e;
      }
    }
  }
}

export function getConvexClient() {
  return getConvexQueryClient().convexClient;
}
