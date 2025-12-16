import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import unpluginIcons from "unplugin-icons/webpack";

initOpenNextCloudflareForDev().catch(console.error);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,

  webpack(config) {
    config.plugins.push(
      unpluginIcons({
        compiler: "jsx",
        jsx: "react",
      }),
    );

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.sharepoint.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/help",
        destination: "/playground",
        permanent: true,
      },
      {
        source: "/help.html",
        destination: "/playground",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
