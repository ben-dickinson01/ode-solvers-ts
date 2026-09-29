// @ts-check
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default defineConfig(
    { ignores: ["dist/**", "node_modules/**"] },
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    // eslint.config.js lives outside tsconfig's `include: ["src"]`
                    allowDefaultProject: ["eslint.config.js", "vitest.config.ts"],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            // numbers in template literals are fine; the rule exists to catch objects
            "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
        },
    },
    // eslint-config-prettier must come last: it disables rules that fight Prettier
    prettier,
);
