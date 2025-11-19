import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],

    languageOptions: {
      globals: globals.node,
      ecmaVersion: "latest",
      sourceType: "module",
    },

    plugins: { js },
    extends: [
      "js/recommended",
    ],

    rules: {
      // Allow console logs in dev
      "no-console": "error",

      // Custom rule for unused variables
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // Enforce code style
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "eqeqeq": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
    },
  },
]);
