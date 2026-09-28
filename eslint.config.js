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
                    allowDefaultProject: ["eslint.config.js"],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    // eslint-config-prettier must come last: it disables rules that fight Prettier
    prettier,
);
