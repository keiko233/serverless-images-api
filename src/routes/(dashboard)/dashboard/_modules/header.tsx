import { useNavigate } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "@/lib/auth-client";

export function Header() {
  const [isPending, startTransition] = useTransition();

  const navigate = useNavigate();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await signOut();
        await navigate({
          to: "/auth",
        });
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <header className="mb-6 flex items-center justify-between">
      <h1>Dashboard</h1>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleLogout}>
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <LogOutIcon className="size-4" />
          )}

          <span>Log out</span>
        </Button>
      </div>
    </header>
  );
}
