import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/v2/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "SnapN Sports V2",
        short_name: "SnapN V2",
        start_url: "/v2/",
        scope: "/v2/",
        display: "standalone",
        background_color: "#121416",
        theme_color: "#121416"
      },
      workbox: {
        navigateFallback: "/v2/index.html",
        navigateFallbackDenylist: [/^\/api\//i],
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"]
      }
    })
  ],
  resolve: {
    alias: {
      "@": "/apps/web/src"
    }
  }
});
