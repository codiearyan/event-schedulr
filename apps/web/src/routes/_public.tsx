import { createFileRoute, Outlet } from "@tanstack/react-router";

import PublicHeader from "@/components/public-header";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="grid h-svh grid-rows-[auto_1fr]">
      <PublicHeader />
      <Outlet />
    </div>
  );
}
