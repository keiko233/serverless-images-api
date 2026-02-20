import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(static)/playground/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(static)/playground/"!</div>;
}
