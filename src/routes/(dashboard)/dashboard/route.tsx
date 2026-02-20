import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getSession } from "@/lib/auth-server";

import { Header } from "./_modules/header";
import { Sidebar, SidebarProvider } from "./_modules/sidebar";

export const Route = createFileRoute("/(dashboard)/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: "/auth",
      });
    }

    return {
      user: session.user,
    };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto p-6">
          <Header />

          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
