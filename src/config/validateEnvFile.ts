const REQUIRED_ENV_VARS = [
    "DATABASE_URL",
    "JWT_SECRET",
    "NODE_ENV",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_CALLBACK_URL",
]

const validateEnvFile = () => {
    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key])

    if (missing.length > 0) {
        throw new Error(`Missing required env vars:\n  ${missing.join("\n  ")}`)
    }
}

validateEnvFile();
