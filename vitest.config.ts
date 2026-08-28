import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./apps/web/src/tests/setup.ts"],
    include: ["apps/web/src/tests/**/*.test.{ts,tsx}"]
  }
});
