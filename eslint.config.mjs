/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/*.tsbuildinfo",
      "supabase/functions/**",
    ],
  },
];
