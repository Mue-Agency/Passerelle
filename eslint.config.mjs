import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Avatars servis depuis l'origine API (URL dynamique en variable d'env) :
    // next/image n'apporte pas de gain pertinent ici. <img> assumé.
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
