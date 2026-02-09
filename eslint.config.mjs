/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    // Basic ignore list; extend with more paths if needed.
    ignores: ["node_modules/**", ".next/**", "dist/**"],
  },
];
