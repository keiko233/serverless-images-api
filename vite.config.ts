import { fileURLToPath, URL } from "node:url";

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

// Absolute path to our ESM shim that replaces the CJS-only
// use-sync-external-store/shim/with-selector packages.
const withSelectorShim = fileURLToPath(
  new URL(
    "./src/lib/use-sync-external-store-with-selector.ts",
    import.meta.url,
  ),
);

// Shim for cloudflare:workers in the client (browser) bundle.
// createServerFn strips handler bodies from the client build, but static
// module-level imports still pull server-only modules into the module graph.
// Providing an empty shim prevents the resolution error; the shim values
// are never actually used because all server function calls become RPC stubs.
const cloudflareClientShim = {
  name: "cloudflare-client-shim",
  resolveId(this: { environment?: { name?: string } }, id: string) {
    if (id === "cloudflare:workers" && this.environment?.name === "client") {
      return "\0cloudflare-workers-shim";
    }
  },
  load(id: string) {
    if (id === "\0cloudflare-workers-shim") {
      return "export const env = {}; export const ctx = {}; export default {};";
    }
  },
};

export default defineConfig({
  clearScreen: false,
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // @tanstack/react-store@0.8.x imports the CJS-only shim which Vite
      // cannot serve as ESM in the browser under TanStack Start + Cloudflare.
      // Redirect both path variants to our native ESM implementation.
      "use-sync-external-store/shim/with-selector.js": withSelectorShim,
      "use-sync-external-store/shim/with-selector": withSelectorShim,
    },
  },
  plugins: [
    cloudflareClientShim,
    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      router: {
        generatedRouteTree: `./route-tree.gen.ts`,
        routeFileIgnorePattern: "_modules",
      },
    }),
    viteReact(),
  ],
});
