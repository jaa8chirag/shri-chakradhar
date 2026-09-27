import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "data/**", "public/**"],
  },
  {
    // One-off ETL scripts against third-party WooCommerce/WP REST responses whose shape
    // varies per site and isn't worth modeling — `any` here is a deliberate boundary, not
    // an oversight (the parsed-out Product/Brand types it produces are still fully typed).
    files: ["scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
