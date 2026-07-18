import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// Flat config (ESLint 9+). Replaces the former .eslintrc.json, which used the
// legacy eslintrc format that ESLint 10 drops entirely.
//
// Invoked via `npm run lint` -> `eslint .`. The old `next lint` script was a
// no-op after the Next 16 upgrade: Next 16 removed the `lint` subcommand, so
// `next lint` was parsed as `next <directory>` and failed on a missing ./lint.
const config = [
  ...nextCoreWebVitals,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "blob-report/**",
      "with-playwright-app/**",
      "design_handoff_blog_redesign/**",
    ],
  },
];

export default config;
