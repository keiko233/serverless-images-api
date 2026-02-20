import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(static)/playground")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
