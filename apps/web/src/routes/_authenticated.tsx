import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import AuthenticatedHeader from "@/components/authenticated-header";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="grid h-svh grid-rows-[auto_1fr]">
      <AuthenticatedHeader />
      <Outlet />
    </div>
  );
}
