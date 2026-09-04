import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// play.snapnsports.com is its own subdomain, so it serves from the root
// path (unlike the /v2/ subpath the main app deploys under).
export default defineConfig({
  base: "/",
  plugins: [react()],
});
