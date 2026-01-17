import { createFileRoute } from "@tanstack/react-router";

import AuthPage from "@/components/Auth/page";

export const Route = createFileRoute("/_auth/auth")({
  component: AuthRoute,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
});

function AuthRoute() {
  return <AuthPage />;
}
