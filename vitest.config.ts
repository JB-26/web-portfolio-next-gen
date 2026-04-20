import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.ts",
      "tests/unit/**/*.test.{js,ts}",
      "tests/integration/**/*.test.{js,ts}",
    ],
    coverage: {
      provider: "v8",
      include: ["lib/comments/**"],
      exclude: ["lib/comments/**/*.test.ts"],
    },
  },
});
