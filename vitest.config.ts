import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    // `.claude/worktrees/*` holds full checkouts of this repo. Without this
    // exclusion every worktree contributes a second copy of the whole suite to
    // `vitest run`, so the same files execute twice in parallel and multiply the
    // load on the single shared transform pipeline. That contention is what made
    // import-heavy tests time out in the full run but pass in isolation.
    exclude: [...configDefaults.exclude, "**/.claude/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
