import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import stylistic from "@stylistic/eslint-plugin";

// PayLens import invariant: @/* maps to this app's src/*.
// Same physical folder → ./relative. Crossing a directory boundary → @/.
// Parent-directory (../) and child-directory (.//*/) source imports are forbidden.
const importBoundaryRules = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["../**"],
          message:
            "Parent-directory imports are forbidden. Use @/ (this app's src/) for cross-directory imports.",
        },
        {
          group: ["./*/*", "./*/*/*", "./*/*/*/*", "./*/*/*/*/*"],
          message:
            "Child-directory relative imports are forbidden. Same-folder files use ./, everything else uses @/.",
        },
      ],
    },
  ],
};
// Semantic spacing: Prettier owns structural formatting; these rules own
// mechanically enforceable blank-line grouping (imports/types/setup/return).
// NOTE: adjacent-group entries use "any" (grouping allowed, not enforced) so
// logical groups stay together while authors may still separate import/type/
// declaration groups with a blank line. They MUST come after the general
// "always" entries: when several entries match a pair, the last match wins.
const readabilityRules = {
  "@stylistic/padding-line-between-statements": [
    "error",
    { blankLine: "always", prev: "import", next: "*" },
    { blankLine: "always", prev: "export", next: "*" },
    { blankLine: "always", prev: ["type", "interface"], next: "*" },
    { blankLine: "always", prev: ["const", "let", "var", "using"], next: "*" },
    { blankLine: "always", prev: "directive", next: "*" },
    { blankLine: "always", prev: "multiline-block-like", next: "*" },
    { blankLine: "always", prev: "*", next: "return" },
    { blankLine: "any", prev: "import", next: "import" },
    { blankLine: "any", prev: ["type", "interface"], next: ["type", "interface"] },
    {
      blankLine: "any",
      prev: ["const", "let", "var", "using"],
      next: ["const", "let", "var", "using"],
    },
  ],
};
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      ...importBoundaryRules,
      ...readabilityRules,
    },
  },
  // Must be last: disables ESLint formatting rules that would fight Prettier.
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
