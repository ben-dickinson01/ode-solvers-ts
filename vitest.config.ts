import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // only source tests — never the compiled copies in dist/
        include: ["src/**/*.test.ts"],
    },
});
