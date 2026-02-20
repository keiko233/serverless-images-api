import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/lib/auth-client";

export const Route = createFileRoute("/(dashboard)/auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isPending, startTransition] = useTransition();

  const handleClick = useCallback(() => {
    startTransition(async () => {
      try {
        await signIn.social({
          provider: "github",
          callbackURL: "/dashboard",
        });
      } catch (error) {
        console.error(error);
      }
    });
  }, []);

  return (
    <Card className="w-full max-w-96">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>

      <CardContent>
        <Button className="w-full" onClick={handleClick}>
          {isPending ? (
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Github className="size-4" />
          )}

          <span>Authenticate with GitHub</span>
        </Button>
      </CardContent>
    </Card>
  );
}
