import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "tests/unit/**/*.test.{js,ts}"],
    coverage: {
      provider: "v8",
      include: ["lib/comments/**"],
      exclude: ["lib/comments/**/*.test.ts"],
    },
  },
});
