/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "next/typescript", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    // Keep console for now; prefer using it sparingly in UI code.
    "no-console": "off",
  },
  ignorePatterns: [".next/", "node_modules/", "chunks/", "out/", "build/", ".vercel/"],
};
