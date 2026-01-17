// import { ConvexQueryClient } from "@convex-dev/react-query";
// import { env } from "@event-schedulr/env/web";
// import { QueryClient } from "@tanstack/react-query";
// import { createRouter as createTanStackRouter } from "@tanstack/react-router";
// import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

// import Loader from "./components/loader";
// import "./index.css";
// import { routeTree } from "./routeTree.gen";

// export function getRouter() {
// 	const convexUrl = env.VITE_CONVEX_URL;
// 	if (!convexUrl) {
// 		throw new Error("VITE_CONVEX_URL is not set");
// 	}

// 	const convexQueryClient = new ConvexQueryClient(convexUrl);

// 	const queryClient: QueryClient = new QueryClient({
// 		defaultOptions: {
// 			queries: {
// 				queryKeyHashFn: convexQueryClient.hashFn(),
// 				queryFn: convexQueryClient.queryFn(),
// 			},
// 		},
// 	});
// 	convexQueryClient.connect(queryClient);

// 	const router = createTanStackRouter({
// 		routeTree,
// 		defaultPreload: "intent",
// 		defaultPendingComponent: () => <Loader />,
// 		defaultNotFoundComponent: () => <div>Not Found</div>,
// 		context: { queryClient, convexQueryClient },
// 	});

// 	setupRouterSsrQueryIntegration({
// 		router,
// 		queryClient,
// 	});

// 	return router;
// }

// declare module "@tanstack/react-router" {
// 	interface Register {
// 		router: ReturnType<typeof getRouter>;
// 	}
// }


// src/routes/router.tsx
import { createRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { ConvexProvider } from 'convex/react';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const convexUrl = (import.meta as any).env.VITE_CONVEX_URL!;
  const convexQueryClient = new ConvexQueryClient(convexUrl, { expectAuth: true });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

	
    const router = createRouter({
      routeTree,
      context: { queryClient, convexQueryClient },
      Wrap: ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>{children}</ConvexProvider>
      ),
    })
  ;

  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}
