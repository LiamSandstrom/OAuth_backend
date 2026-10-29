import { defineConfig } from "vitest/config"
import dotenv from "dotenv"

const env = dotenv.config({ path: ".env.test", processEnv: {}, quiet: true }).parsed ?? {}

export default defineConfig({
    test: {
        env,
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            exclude: ["src/generated/**", "src/types/**", "src/server.ts"],
        },
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    include: ["tests/unit/**/*.test.ts"],
                },
            },
            {
                extends: true,
                test: {
                    name: "integration",
                    include: ["tests/integration/**/*.test.ts"],
                    globalSetup: ["tests/integration/globalSetup.ts"],
                    setupFiles: ["tests/integration/setup.ts"],
                    fileParallelism: false,
                },
            },
        ],
    },
})
