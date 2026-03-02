import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // IMPORTANT: replace with your exact repo name
  base: "/nft-weingarten1/",

  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Poll Media App",
        short_name: "PollApp",
        description: "Polling and Media Upload App",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",

        // IMPORTANT: replace with your exact repo name
        start_url: "/nft-weingarten1/",
        scope: "/nft-weingarten1/",

        icons: [
          {
            src: "/nft-weingarten1/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/nft-weingarten1/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});