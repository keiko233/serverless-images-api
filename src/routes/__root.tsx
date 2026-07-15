import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { PropsWithChildren } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/lib/utils";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Serverless Images API",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16 text-center">
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground">
          The page you requested does not exist.
        </p>
        <Link
          to="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

function RootDocument({ children }: PropsWithChildren) {
  const isDark = useColorScheme();

  return (
    <html lang="en" className={cn(isDark && "dark")}>
      <head>
        <HeadContent />
      </head>

      <body>
        <div className="relative isolate flex min-h-svh flex-col">
          {children}
        </div>

        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />

        <Scripts />
      </body>
    </html>
  );
}
