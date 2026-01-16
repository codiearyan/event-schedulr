import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";

function getConvexUrl() {
  if (typeof window === "undefined") {
    return process.env.CONVEX_URL!;
  }
  return (import.meta as any).env.VITE_CONVEX_URL!;
}

let convexQueryClientSingleton: ConvexQueryClient | null = null;
let queryClientSingleton: QueryClient | null = null;
let isConnected = false;

export function getConvexQueryClient(): ConvexQueryClient {
  if (!convexQueryClientSingleton) {
    convexQueryClientSingleton = new ConvexQueryClient(getConvexUrl(), {
      expectAuth: true,
    });
  }
  return convexQueryClientSingleton;
}

export function getQueryClient(): QueryClient {
  if (!queryClientSingleton) {
    const convexQueryClient = getConvexQueryClient();
    queryClientSingleton = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
        },
      },
    });
  }
  return queryClientSingleton;
}

export function connectConvexToQueryClient() {
  if (!isConnected) {
    const convexQueryClient = getConvexQueryClient();
    const queryClient = getQueryClient();
    convexQueryClient.connect(queryClient);
    isConnected = true;
  }
}

export function getConvexClient() {
  return getConvexQueryClient().convexClient;
}
