import { execSync } from "node:child_process"
import dotenv from "dotenv"
import { assertTestDatabase } from "./assertTestDatabase.js"

export default function setup() {
    const env = dotenv.config({ path: ".env.test", processEnv: {}, quiet: true }).parsed ?? {}
    const databaseUrl = env.DATABASE_URL
    assertTestDatabase(databaseUrl)

    execSync("npx prisma migrate deploy", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: databaseUrl },
    })
}
