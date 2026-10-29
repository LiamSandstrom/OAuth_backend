export function assertTestDatabase(url: string | undefined) {
    const dbName = url ? new URL(url).pathname.slice(1) : ""
    if (!dbName.includes("test")) {
        throw new Error(
            `Refusing to run integration tests against database "${dbName}". ` +
            `DATABASE_URL must point at a database whose name contains "test".`
        )
    }
}
