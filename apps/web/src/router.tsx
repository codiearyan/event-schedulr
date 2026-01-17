import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexReactClient } from "convex/react";
import { routeTree } from "./routeTree.gen";

const getConvexUrl = () => {
  if (typeof window === "undefined") {
    return process.env.CONVEX_URL!;
  }
  return (import.meta as any).env.VITE_CONVEX_URL!;
};

let convexClient: ConvexReactClient | null = null;
let convexQueryClient: ConvexQueryClient | null = null;
let queryClient: QueryClient | null = null;
let isConnected = false;

export function getConvexClient() {
  if (!convexClient) {
    convexClient = new ConvexReactClient(getConvexUrl());
  }
  return convexClient;
}

export function getConvexQueryClient() {
  if (!convexQueryClient) {
    convexQueryClient = new ConvexQueryClient(getConvexClient(), {
      expectAuth: true,
    });
  }
  return convexQueryClient;
}

export function getQueryClient() {
  const cqc = getConvexQueryClient();

  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: cqc.hashFn(),
          queryFn: cqc.queryFn(),
        },
      },
    });
  }

  if (!isConnected) {
    cqc.connect(queryClient);
    isConnected = true;
  }

  return queryClient;
}

export function getRouter() {
  const cqc = getConvexQueryClient();
  const qc = getQueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient: qc, convexQueryClient: cqc },
  });

  setupRouterSsrQueryIntegration({ router, queryClient: qc });
  return router;
}
